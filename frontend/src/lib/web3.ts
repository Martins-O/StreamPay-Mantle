import { createConfig, http } from 'wagmi';
import { mantle } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

const defaultMantleRpc = (import.meta.env.VITE_MANTLE_RPC_URL as string | undefined) || 'https://mantle-sepolia.drpc.org';

export const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  network: 'mantle-sepolia',
  nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: [defaultMantleRpc] },
    public: { http: [defaultMantleRpc] },
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
  name: 'StreamPay Mantle',
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
    [mantleSepolia.id]: http(mantleSepolia.rpcUrls.default.http[0]),
    [mantle.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
