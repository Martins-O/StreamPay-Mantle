const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

const isAddress = (value: string | undefined): value is `0x${string}` =>
  !!value && /^0x[a-fA-F0-9]{40}$/.test(value);

const streamManagerEnv = import.meta.env.VITE_STREAM_MANAGER_ADDRESS as string | undefined;
const streamVaultEnv = import.meta.env.VITE_STREAM_VAULT_ADDRESS as string | undefined;
const mockTokenEnv = import.meta.env.VITE_MOCK_USDT_ADDRESS as string | undefined;
const streamTokenEnv = import.meta.env.VITE_STREAM_TOKEN_ADDRESS as string | undefined;

export const STREAM_MANAGER_ADDRESS = (isAddress(streamManagerEnv)
  ? streamManagerEnv
  : ZERO_ADDRESS) as `0x${string}`;

export const STREAM_VAULT_ADDRESS = (isAddress(streamVaultEnv)
  ? streamVaultEnv
  : ZERO_ADDRESS) as `0x${string}`;

export const MOCK_USDT_ADDRESS = (isAddress(mockTokenEnv)
  ? mockTokenEnv
  : ZERO_ADDRESS) as `0x${string}`;

const resolvedStreamToken = isAddress(streamTokenEnv)
  ? streamTokenEnv
  : isAddress(mockTokenEnv)
    ? mockTokenEnv
    : ZERO_ADDRESS;

export const STREAM_TOKEN_ADDRESS = resolvedStreamToken as `0x${string}`;

export const IS_STREAM_MANAGER_CONFIGURED = STREAM_MANAGER_ADDRESS !== ZERO_ADDRESS;
export const IS_STREAM_TOKEN_CONFIGURED = STREAM_TOKEN_ADDRESS !== ZERO_ADDRESS;

export const STREAM_MANAGER_ABI = [
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ],
    name: 'createStream',
    outputs: [{ name: 'streamId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'params',
        type: 'tuple[]',
        components: [
          { name: 'recipient', type: 'address' },
          { name: 'tokens', type: 'address[]' },
          { name: 'totalAmounts', type: 'uint256[]' },
          { name: 'duration', type: 'uint256' },
        ],
      },
    ],
    name: 'createStreamsBatch',
    outputs: [{ name: 'streamIds', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'tokens', type: 'address[]' },
      { name: 'totalAmounts', type: 'uint256[]' },
      { name: 'duration', type: 'uint256' },
    ],
    name: 'createMultiTokenStream',
    outputs: [{ name: 'streamId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'cancelStream',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamIds', type: 'uint256[]' }],
    name: 'claimStreamsBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'pauseStream',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'resumeStream',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'getStream',
    outputs: [
      {
        components: [
          { name: 'sender', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'startTime', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
          { name: 'stopTime', type: 'uint256' },
          { name: 'lastClaimed', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'isPaused', type: 'bool' },
          { name: 'pauseStart', type: 'uint256' },
          { name: 'pausedDuration', type: 'uint256' },
        ],
        name: 'stream',
        type: 'tuple',
      },
      {
        components: [
          { name: 'token', type: 'address' },
          { name: 'totalAmount', type: 'uint256' },
          { name: 'claimedAmount', type: 'uint256' },
        ],
        name: 'allocations',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'getStreamableAmounts',
    outputs: [
      { name: 'tokens', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'getStreamTranches',
    outputs: [
      {
        components: [
          { name: 'token', type: 'address' },
          { name: 'totalAmount', type: 'uint256' },
          { name: 'claimedAmount', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
          { name: 'pauseAccumulated', type: 'uint256' },
          { name: 'pauseCarry', type: 'uint256' },
          { name: 'lastAccrued', type: 'uint256' },
        ],
        name: 'tranches',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'sender', type: 'address' }],
    name: 'getSenderStreams',
    outputs: [{ name: 'streamIds', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'recipient', type: 'address' }],
    name: 'getRecipientStreams',
    outputs: [{ name: 'streamIds', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'streamId', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'topUpStream',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'streamId', type: 'uint256' },
      { name: 'additionalDuration', type: 'uint256' },
    ],
    name: 'extendStreamDuration',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'streamId', type: 'uint256' },
      { name: 'newRecipient', type: 'address' },
    ],
    name: 'updateStreamRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'strategy', type: 'address' },
      { name: 'reserveRatioBps', type: 'uint16' },
    ],
    name: 'configureYieldStrategy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'pushToYieldStrategy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'harvestYield',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface StreamTokenAllocation {
  token: `0x${string}`;
  totalAmount: bigint;
  claimedAmount: bigint;
  claimableAmount: bigint;
  tokenDecimals?: number;
  tokenSymbol?: string;
}

export interface StreamTranche {
  token: `0x${string}`;
  totalAmount: bigint;
  claimedAmount: bigint;
  startTime: bigint;
  duration: bigint;
  pauseAccumulated: bigint;
  pauseCarry: bigint;
  lastAccrued: bigint;
  claimableAmount?: bigint;
  tokenDecimals?: number;
  tokenSymbol?: string;
}

export interface Stream {
  id: bigint;
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
  tokens: StreamTokenAllocation[];
  tranches?: StreamTranche[];
}

export { ZERO_ADDRESS };

export const STREAM_VAULT_ABI = [
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getTotalManaged',
    outputs: [{ name: 'total', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getTokenBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getStrategy',
    outputs: [
      { name: 'strategy', type: 'address' },
      { name: 'reserveRatioBps', type: 'uint16' },
      { name: 'enabled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
