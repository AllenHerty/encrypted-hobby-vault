import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';
import { http } from 'wagmi';

const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY || 'b18fb7e6ca7045ac83c41157ab93f990';

// Use local hardhat for development
const LOCAL_RPC_URL = 'http://localhost:8545';

if (!INFURA_API_KEY) {
  console.warn('VITE_INFURA_API_KEY is not set. Sepolia network may not work properly.');
}

// Configure Sepolia with explicit Infura RPC URL
const sepoliaWithInfura = {
  ...sepolia,
  id: 11155111,
  name: 'Sepolia',
  rpcUrls: {
    default: {
      http: [`https://sepolia.infura.io/v3/${INFURA_API_KEY}`],
    },
    public: {
      http: [`https://sepolia.infura.io/v3/${INFURA_API_KEY}`],
    },
  },
};

// Configure Hardhat local network with chainId 31337
const hardhatLocal = {
  ...hardhat,
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [LOCAL_RPC_URL],
    },
    public: {
      http: [LOCAL_RPC_URL],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'Encrypt Hobby',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'ef3325a718834a2b1b4134d3f520933d',
  chains: [hardhatLocal, sepoliaWithInfura],
  transports: {
    [hardhatLocal.id]: http(LOCAL_RPC_URL),
    [sepoliaWithInfura.id]: http(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
  },
  ssr: false,
});

