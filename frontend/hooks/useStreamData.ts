'use client'

import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, STREAM_MANAGER_ABI } from '@/lib/contracts'

export function useStreamData(streamId: bigint) {
  const { data: stream, isLoading, refetch } = useReadContract({
    abi: STREAM_MANAGER_ABI,
    address: CONTRACTS.STREAM_MANAGER,
    functionName: 'getStream',
    args: [streamId],
  })

  const { data: streamableAmount, refetch: refetchAmount } = useReadContract({
    abi: STREAM_MANAGER_ABI,
    address: CONTRACTS.STREAM_MANAGER,
    functionName: 'getStreamableAmount',
    args: [streamId],
  })

  return {
    stream,
    streamableAmount,
    isLoading,
    refetch,
    refetchAmount,
  }
}

export function useUserStreams() {
  const { address } = useAccount()

  const { data: senderStreams, isLoading: loadingSender } = useReadContract({
    abi: STREAM_MANAGER_ABI,
    address: CONTRACTS.STREAM_MANAGER,
    functionName: 'getSenderStreams',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: recipientStreams, isLoading: loadingRecipient } = useReadContract({
    abi: STREAM_MANAGER_ABI,
    address: CONTRACTS.STREAM_MANAGER,
    functionName: 'getRecipientStreams',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    senderStreams: senderStreams || [],
    recipientStreams: recipientStreams || [],
    isLoading: loadingSender || loadingRecipient,
  }
}