import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId } from 'wagmi';

const WalletConnect = () => {
  const chainId = useChainId();

  const getNetworkName = (id: number) => {
    switch (id) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 31337: return 'Local Hardhat';
      case 1337: return 'Local Ganache';
      default: return `Chain ${id}`;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ConnectButton
        chainStatus="icon"
        showBalance={false}
      />
      {chainId && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getNetworkName(chainId)}
        </span>
      )}
    </div>
  );
};

export default WalletConnect;

