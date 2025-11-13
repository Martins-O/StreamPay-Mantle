import { useCallback, useEffect, useState } from 'react';
import { usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import {
  STREAM_MANAGER_ADDRESS,
  STREAM_MANAGER_ABI,
  STREAM_VAULT_ADDRESS,
  STREAM_VAULT_ABI,
  ERC20_ABI,
  IS_STREAM_MANAGER_CONFIGURED,
  ZERO_ADDRESS,
  type Stream,
  type StreamTokenAllocation,
  type StreamTranche,
} from './contract';
import { formatUnits } from 'viem';
import { calculateAccrual } from './accounting';

const DEFAULT_TOKEN_DECIMALS = 18;

const tokenMetadataCache = new Map<
  string,
  {
    decimals: number;
    symbol?: string;
  }
>();

type RawStreamStruct = {
  sender: `0x${string}`;
  recipient: `0x${string}`;
  startTime: bigint;
  duration: bigint;
  stopTime: bigint;
  lastClaimed: bigint;
  isActive: boolean;
  isPaused: boolean;
  pauseStart: bigint;
  pausedDuration: bigint;
};

type RawStreamToken = {
  token: `0x${string}`;
  totalAmount: bigint;
  claimedAmount: bigint;
};

type RawStreamResponse = [RawStreamStruct, readonly RawStreamToken[]];

type RawTranche = {
  token: `0x${string}`;
  totalAmount: bigint;
  claimedAmount: bigint;
  startTime: bigint;
  duration: bigint;
  pauseAccumulated: bigint;
  pauseCarry: bigint;
  lastAccrued: bigint;
};

type MetadataEntry = readonly [string, { decimals: number; symbol?: string }];

type ClaimableMap = Map<string, bigint>;

const computePausedDurationForTranche = (stream: RawStreamStruct, tranche: RawTranche): bigint => {
  let paused = stream.pausedDuration;
  if (paused <= tranche.pauseAccumulated) {
    return 0n;
  }

  paused -= tranche.pauseAccumulated;

  if (tranche.pauseCarry > 0n) {
    if (paused <= tranche.pauseCarry) {
      return 0n;
    }
    paused -= tranche.pauseCarry;
  }

  return paused;
};

const calculateTrancheClaimable = (
  stream: RawStreamStruct,
  tranche: RawTranche,
  timestamp: bigint,
): bigint => {
  const pausedDuration = computePausedDurationForTranche(stream, tranche);
  const { claimable } = calculateAccrual({
    totalAmount: tranche.totalAmount,
    claimedAmount: tranche.claimedAmount,
    startTime: tranche.startTime,
    duration: tranche.duration,
    lastClaimed: tranche.lastAccrued,
    stopTime: stream.stopTime,
    timestamp,
    isPaused: stream.isPaused,
    pauseStart: stream.pauseStart,
    pausedDuration,
  });
  return claimable;
};

const normaliseStream = (
  streamId: bigint,
  raw: RawStreamStruct,
  allocations: readonly RawStreamToken[],
  tranches: readonly RawTranche[],
  claimable: ClaimableMap,
  metadata: Map<string, { decimals: number; symbol?: string }>,
): Stream => {
  const tokens: StreamTokenAllocation[] = allocations.map((asset) => {
    const key = asset.token.toLowerCase();
    const meta = metadata.get(key);
    return {
      token: asset.token,
      totalAmount: asset.totalAmount,
      claimedAmount: asset.claimedAmount,
      claimableAmount: claimable.get(key) ?? 0n,
      tokenDecimals: meta?.decimals,
      tokenSymbol: meta?.symbol,
    } satisfies StreamTokenAllocation;
  });

  const trancheTimestamp = BigInt(Math.floor(Date.now() / 1000));
  const normalisedTranches: StreamTranche[] | undefined = tranches.length
    ? tranches.map((tranche) => {
        const key = tranche.token.toLowerCase();
        const meta = metadata.get(key);
        const claimableAmount = calculateTrancheClaimable(raw, tranche, trancheTimestamp);
        return {
          token: tranche.token,
          totalAmount: tranche.totalAmount,
          claimedAmount: tranche.claimedAmount,
          startTime: tranche.startTime,
          duration: tranche.duration,
          pauseAccumulated: tranche.pauseAccumulated,
          pauseCarry: tranche.pauseCarry,
          lastAccrued: tranche.lastAccrued,
          claimableAmount,
          tokenDecimals: meta?.decimals,
          tokenSymbol: meta?.symbol,
        } satisfies StreamTranche;
      })
    : undefined;

  return {
    id: streamId,
    sender: raw.sender,
    recipient: raw.recipient,
    startTime: raw.startTime,
    duration: raw.duration,
    stopTime: raw.stopTime,
    lastClaimed: raw.lastClaimed,
    isActive: raw.isActive,
    isPaused: raw.isPaused,
    pauseStart: raw.pauseStart,
    pausedDuration: raw.pausedDuration,
    tokens,
    tranches: normalisedTranches,
  } satisfies Stream;
};

// Hook to fetch streams for an address
export function useStreams(address: `0x${string}` | undefined) {
  const publicClient = usePublicClient();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefreshIndex((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!IS_STREAM_MANAGER_CONFIGURED) {
      setStreams([]);
      setIsLoading(false);
      setError(new Error('Stream manager contract address is not configured.'));
      return;
    }

    if (!address || !publicClient) {
      setStreams([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchStreams = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [senderIds, recipientIds] = await Promise.all([
          publicClient.readContract({
            address: STREAM_MANAGER_ADDRESS,
            abi: STREAM_MANAGER_ABI,
            functionName: 'getSenderStreams',
            args: [address],
          }) as Promise<readonly bigint[]>,
          publicClient.readContract({
            address: STREAM_MANAGER_ADDRESS,
            abi: STREAM_MANAGER_ABI,
            functionName: 'getRecipientStreams',
            args: [address],
          }) as Promise<readonly bigint[]>,
        ]);

        const uniqueIds = Array.from(
          new Set([...senderIds, ...recipientIds].map((id) => id.toString()))
        ).map((id) => BigInt(id));

        if (uniqueIds.length === 0) {
          if (!cancelled) {
            setStreams([]);
            setIsLoading(false);
          }
          return;
        }

        const rawResults = await Promise.all(
          uniqueIds.map(async (streamId) => {
            const [rawStream, rawAllocations] = await publicClient.readContract({
              address: STREAM_MANAGER_ADDRESS,
              abi: STREAM_MANAGER_ABI,
              functionName: 'getStream',
              args: [streamId],
            }) as RawStreamResponse;

            const [tokenAddresses, claimableAmounts] = await publicClient.readContract({
              address: STREAM_MANAGER_ADDRESS,
              abi: STREAM_MANAGER_ABI,
              functionName: 'getStreamableAmounts',
              args: [streamId],
            }) as readonly [readonly `0x${string}`[], readonly bigint[]];

            const rawTranches = await publicClient.readContract({
              address: STREAM_MANAGER_ADDRESS,
              abi: STREAM_MANAGER_ABI,
              functionName: 'getStreamTranches',
              args: [streamId],
            }) as readonly RawTranche[];

            const claimable = new Map<string, bigint>();
            tokenAddresses.forEach((token, index) => {
              const key = token.toLowerCase();
              const amount = claimableAmounts[index] ?? 0n;
              claimable.set(key, amount);
            });

            return {
              streamId,
              rawStream,
              rawAllocations,
              rawTranches,
              claimable,
            };
          })
        );

        const uniqueTokenAddresses = Array.from(
          new Set(
            rawResults
              .flatMap((item) => [
                ...item.rawAllocations.map((allocation) => allocation.token.toLowerCase()),
                ...item.rawTranches.map((tranche) => tranche.token.toLowerCase()),
              ])
          )
        );

        const metadataEntries = await Promise.all(
          uniqueTokenAddresses.map(async (tokenAddress) => {
            const cached = tokenMetadataCache.get(tokenAddress);
            if (cached) {
              return [tokenAddress, cached] as MetadataEntry;
            }

            try {
              const [decimals, symbol] = await Promise.all([
                publicClient.readContract({
                  address: tokenAddress as `0x${string}`,
                  abi: ERC20_ABI,
                  functionName: 'decimals',
                }) as Promise<bigint | number>,
                publicClient.readContract({
                  address: tokenAddress as `0x${string}`,
                  abi: ERC20_ABI,
                  functionName: 'symbol',
                }).catch(() => ''),
              ]);

              const metadata = {
                decimals:
                  typeof decimals === 'bigint'
                    ? Number(decimals)
                    : typeof decimals === 'number'
                      ? decimals
                      : DEFAULT_TOKEN_DECIMALS,
                symbol: typeof symbol === 'string' && symbol.length > 0 ? symbol : undefined,
              };

              tokenMetadataCache.set(tokenAddress, metadata);
              return [tokenAddress, metadata] as MetadataEntry;
            } catch (metadataError) {
              const fallback = { decimals: DEFAULT_TOKEN_DECIMALS };
              tokenMetadataCache.set(tokenAddress, fallback);
              return [tokenAddress, fallback] as MetadataEntry;
            }
          })
        );

        const metadataMap = new Map(metadataEntries);

        const normalised = rawResults.map(({ streamId, rawStream, rawAllocations, rawTranches, claimable }) =>
          normaliseStream(streamId, rawStream, rawAllocations, rawTranches, claimable, metadataMap)
        );

        const sorted = normalised.sort((a, b) => Number(b.startTime) - Number(a.startTime));

        if (!cancelled) {
          setStreams(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setStreams([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchStreams();

    return () => {
      cancelled = true;
    };
  }, [address, publicClient, refreshIndex]);

  return {
    streams,
    isLoading,
    error,
    refetch,
  };
}

// Hook to create a stream with a single token
export function useCreateStream() {
  const { writeContractAsync, isPending, isSuccess, error, data } = useWriteContract();

  const createStream = async (
    recipient: `0x${string}`,
    token: `0x${string}`,
    totalAmount: bigint,
    duration: bigint,
  ) => {
    try {
      const request = {
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'createStream',
        args: [recipient, token, totalAmount, duration] as const,
      } satisfies Parameters<typeof writeContractAsync>[0];
      const hash = await writeContractAsync(request);
      return hash;
    } catch (err) {
      console.error('Create stream error:', err);
      throw err;
    }
  };

  return { createStream, isPending, isSuccess, error, data };
}

export function useCreateStreamsBatch() {
  const { writeContractAsync, isPending, isSuccess, error, data } = useWriteContract();

  const createStreamsBatch = async (
    params: Array<{
      recipient: `0x${string}`;
      tokens: `0x${string}`[];
      totalAmounts: bigint[];
      duration: bigint;
    }>,
  ) => {
    try {
      const request = {
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'createStreamsBatch',
        args: [params] as const,
      } satisfies Parameters<typeof writeContractAsync>[0];
      const hash = await writeContractAsync(request);
      return hash;
    } catch (err) {
      console.error('Create stream batch error:', err);
      throw err;
    }
  };

  return { createStreamsBatch, isPending, isSuccess, error, data };
}

export function useClaimStream() {
  const { writeContractAsync, isPending, isSuccess, error, data } = useWriteContract();

  const claimStream = async (streamId: bigint) => {
    try {
      const request = {
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'claim',
        args: [streamId] as const,
      } satisfies Parameters<typeof writeContractAsync>[0];
      const hash = await writeContractAsync(request);
      return hash;
    } catch (err) {
      console.error('Claim stream error:', err);
      throw err;
    }
  };

  return { claimStream, isPending, isSuccess, error, data };
}

export function useClaimStreamsBatch() {
  const { writeContractAsync, isPending, isSuccess, error, data } = useWriteContract();

  const claimStreamsBatch = async (streamIds: bigint[]) => {
    try {
      if (streamIds.length === 0) {
        throw new Error('No stream IDs provided');
      }

      const request = {
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'claimStreamsBatch',
        args: [streamIds] as const,
      } satisfies Parameters<typeof writeContractAsync>[0];

      const hash = await writeContractAsync(request);
      return hash;
    } catch (err) {
      console.error('Claim streams batch error:', err);
      throw err;
    }
  };

  return { claimStreamsBatch, isPending, isSuccess, error, data };
}

export function useCancelStream() {
  const { writeContractAsync, isPending, isSuccess, error, data } = useWriteContract();

  const cancelStream = async (streamId: bigint) => {
    try {
      const request = {
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'cancelStream',
        args: [streamId] as const,
      } satisfies Parameters<typeof writeContractAsync>[0];
      const hash = await writeContractAsync(request);
      return hash;
    } catch (err) {
      console.error('Cancel stream error:', err);
      throw err;
    }
  };

  return { cancelStream, isPending, isSuccess, error, data };
}

export function usePauseStream() {
  const { writeContractAsync, isPending, isSuccess, error, data } = useWriteContract();

  const pauseStream = async (streamId: bigint) => {
    try {
      const request = {
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'pauseStream',
        args: [streamId] as const,
      } satisfies Parameters<typeof writeContractAsync>[0];
      const hash = await writeContractAsync(request);
      return hash;
    } catch (err) {
      console.error('Pause stream error:', err);
      throw err;
    }
  };

  return { pauseStream, isPending, isSuccess, error, data };
}

export function useResumeStream() {
  const { writeContractAsync, isPending, isSuccess, error, data } = useWriteContract();

  const resumeStream = async (streamId: bigint) => {
    try {
      const request = {
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'resumeStream',
        args: [streamId] as const,
      } satisfies Parameters<typeof writeContractAsync>[0];
      const hash = await writeContractAsync(request);
      return hash;
    } catch (err) {
      console.error('Resume stream error:', err);
      throw err;
    }
  };

  return { resumeStream, isPending, isSuccess, error, data };
}

export function useTokenBalance(
  tokenAddress: `0x${string}` | undefined,
  account: `0x${string}` | undefined,
) {
  const { data, isLoading, error } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    query: { enabled: !!(tokenAddress && account) },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
  };
}

export function useYieldInfo(tokenAddress: `0x${string}` | undefined) {
  const { data: totalManaged } = useReadContract({
    address: STREAM_VAULT_ADDRESS,
    abi: STREAM_VAULT_ABI,
    functionName: 'getTotalManaged',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!(tokenAddress && STREAM_VAULT_ADDRESS !== ZERO_ADDRESS) },
  });

  const { data: strategyInfo } = useReadContract({
    address: STREAM_VAULT_ADDRESS,
    abi: STREAM_VAULT_ABI,
    functionName: 'getStrategy',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!(tokenAddress && STREAM_VAULT_ADDRESS !== ZERO_ADDRESS) },
  });

  const { data: vaultBalance } = useReadContract({
    address: STREAM_VAULT_ADDRESS,
    abi: STREAM_VAULT_ABI,
    functionName: 'getTokenBalance',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!(tokenAddress && STREAM_VAULT_ADDRESS !== ZERO_ADDRESS) },
  });

  return {
    totalManaged: totalManaged as bigint | undefined,
    vaultBalance: vaultBalance as bigint | undefined,
    strategyInfo: strategyInfo as readonly [string, number, boolean] | undefined,
  };
}

export function useStreamProgress(stream: Stream | null) {
  const [claimableAmount, setClaimableAmount] = useState<bigint>(0n);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!stream || !stream.isActive) {
      setClaimableAmount(0n);
      setProgress(0);
      return;
    }

    const primaryToken = stream.tokens[0];
    if (!primaryToken) {
      setClaimableAmount(0n);
      setProgress(0);
      return;
    }

    if (stream.isPaused) {
      const reference = stream.pauseStart > 0n ? stream.pauseStart : BigInt(Math.floor(Date.now() / 1000));
      const elapsed = reference > stream.startTime ? reference - stream.startTime : 0n;
      const effective = elapsed > stream.pausedDuration ? elapsed - stream.pausedDuration : 0n;
      setClaimableAmount(primaryToken.claimableAmount);
      setProgress(stream.duration > 0n ? Number((effective * 100n) / stream.duration) : 0);
      return;
    }

    const updateProgress = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const reference = stream.isPaused && stream.pauseStart > 0n ? stream.pauseStart : now;
      const elapsed = reference > stream.startTime ? reference - stream.startTime : 0n;
      const totalDuration = stream.duration;
      const effectivePaused = stream.pausedDuration;
      const effectiveElapsed = elapsed > effectivePaused ? elapsed - effectivePaused : 0n;

      if (effectiveElapsed >= totalDuration && totalDuration > 0n) {
        const remaining = primaryToken.totalAmount > primaryToken.claimedAmount
          ? primaryToken.totalAmount - primaryToken.claimedAmount
          : 0n;
        setClaimableAmount(remaining);
        setProgress(100);
        return;
      }

      if (totalDuration === 0n) {
        setClaimableAmount(0n);
        setProgress(0);
        return;
      }

      const streamed = (primaryToken.totalAmount * effectiveElapsed) / totalDuration;
      const claimable = streamed > primaryToken.claimedAmount ? streamed - primaryToken.claimedAmount : 0n;
      setClaimableAmount(claimable);
      setProgress(Number((effectiveElapsed * 100n) / totalDuration));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1_000);

    return () => clearInterval(interval);
  }, [stream]);

  return { claimableAmount, progress };
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number | undefined = DEFAULT_TOKEN_DECIMALS,
): string {
  const resolvedDecimals =
    typeof decimals === 'number' && decimals >= 0 ? decimals : DEFAULT_TOKEN_DECIMALS;

  return formatUnits(amount, resolvedDecimals);
}
