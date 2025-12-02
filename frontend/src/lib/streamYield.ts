const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

const isAddress = (value: string | undefined): value is `0x${string}` =>
  !!value && /^0x[a-fA-F0-9]{40}$/.test(value);

const env = import.meta.env;

export const BACKEND_BASE_URL = env.VITE_BACKEND_API_URL ?? 'http://127.0.0.1:4000';
export const REVENUE_FACTORY_ADDRESS = (isAddress(env.VITE_REVENUE_FACTORY_ADDRESS)
  ? env.VITE_REVENUE_FACTORY_ADDRESS
  : ZERO_ADDRESS) as `0x${string}`;
export const RISK_ORACLE_ADDRESS = (isAddress(env.VITE_RISK_ORACLE_ADDRESS)
  ? env.VITE_RISK_ORACLE_ADDRESS
  : ZERO_ADDRESS) as `0x${string}`;
export const PRIMARY_YIELD_POOL = (isAddress(env.VITE_PRIMARY_YIELD_POOL)
  ? env.VITE_PRIMARY_YIELD_POOL
  : ZERO_ADDRESS) as `0x${string}`;

export const REVENUE_FACTORY_ABI = [
  {
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'expectedRevenue', type: 'uint256' },
          { name: 'tenor', type: 'uint256' },
          { name: 'paymentToken', type: 'address' },
        ],
      },
    ],
    name: 'createRevenueToken',
    outputs: [{ type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'business', type: 'address' }],
    name: 'getBusinessTokens',
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const YIELD_POOL_ABI = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'availableCapacity',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export { ZERO_ADDRESS };
