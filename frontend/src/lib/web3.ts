import { createConfig } from 'wagmi';
import { mantle } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain, fallback, http } from 'viem';

const DEFAULT_MANTLE_RPCS = [
  'https://rpc.sepolia.mantle.xyz',
  'https://mantle-sepolia.drpc.org',
] as const;

const envMantleRpc = import.meta.env.VITE_MANTLE_RPC_URL as string | undefined;
const mantleRpcUrls = (envMantleRpc ? envMantleRpc.split(',') : DEFAULT_MANTLE_RPCS)
  .map((url) => url.trim())
  .filter((url) => url.length > 0);

const resolvedMantleRpcUrls = mantleRpcUrls.length ? mantleRpcUrls : [...DEFAULT_MANTLE_RPCS];

const mantleTransport = fallback(
  resolvedMantleRpcUrls.map((url) =>
    http(url, {
      retryCount: 2,
      retryDelay: 500,
    })
  )
);

export const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  network: 'mantle-sepolia',
  nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: resolvedMantleRpcUrls },
    public: { http: resolvedMantleRpcUrls },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://explorer.sepolia.mantle.xyz',
    },
  },
  testnet: true,
});

export const TARGET_CHAIN_ID = mantleSepolia.id;
export const TARGET_CHAIN_NAME = mantleSepolia.name;

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
const appMetadata = {
  name: 'Liquifi',
  description: 'Real-time payment streaming on Mantle L2',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://streampay.example',
  icons: ['https://avatars.githubusercontent.com/u/37784886?s=200&v=4'],
};

const connectors = [
  injected({ shimDisconnect: true }),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: appMetadata,
          showQrModal: true,
        }),
      ]
    : []),
];

export const config = createConfig({
  chains: [mantleSepolia, mantle],
  connectors,
  transports: {
    [mantleSepolia.id]: mantleTransport,
    [mantle.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
