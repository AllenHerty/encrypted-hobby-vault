# Encrypt Hobby - Encrypted Private Hobby Tracker

🌐 **Live Demo**: [https://encrypt-hobby.vercel.app/](https://encrypt-hobby.vercel.app/)

📹 **Demo Video**: [https://github.com/AllenHerty/encrypted-hobby-vault/blob/main/encrypt-hobby.mp4](https://github.com/AllenHerty/encrypted-hobby-vault/blob/main/encrypt-hobby.mp4)

---

A privacy-preserving hobby tracking application using Fully Homomorphic Encryption (FHE) on the blockchain. Record your hobbies anonymously with encrypted data and analyze your interests and engagement patterns without revealing details.

## Features

- **Encrypted Data Storage**: All hobby data is encrypted using FHE before being stored on-chain
- **Anonymous Analysis**: Analyze hobby patterns without revealing specific details
- **Category-Enjoyment Correlation**: Identify which hobby categories bring you the most enjoyment
- **Engagement Trends**: Track your hobby engagement levels over time
- **Decrypt on Demand**: Decrypt and view your entries when needed
- **Batch Operations**: Support for adding multiple entries at once
- **Network Switching**: Seamless switching between different blockchain networks
- **Enhanced Error Handling**: Comprehensive error handling and user feedback

## Project Structure

```
encrypt-hobby/
├── contracts/              # Smart contracts
│   └── EncryptedPrivateExpenseLog.sol
├── deploy/                 # Deployment scripts
│   └── 001_deploy_EncryptedPrivateExpenseLog.ts
├── test/                   # Test scripts
│   ├── EncryptedPrivateExpenseLog.ts
│   └── EncryptedPrivateExpenseLogSepolia.ts
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── HobbyEntryForm.tsx
│   │   │   ├── HobbyHistory.tsx
│   │   │   └── HobbyAnalysis.tsx
│   │   ├── hooks/          # Custom hooks
│   │   │   └── useHobbyLog.tsx
│   │   ├── fhevm/          # FHEVM utilities
│   │   └── lib/            # Utility libraries
│   └── public/            # Static assets
└── scripts/                # Utility scripts
```

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- Hardhat node with FHEVM support (for local development)
- Rainbow wallet browser extension

## Installation

### 1. Install Contract Dependencies

   ```bash
cd encrypt-hobby
   npm install
   ```

### 2. Install Frontend Dependencies

   ```bash
cd frontend
npm install
```

## Configuration

### Contract Configuration

Create a `.env` file in the root directory:

```env
MNEMONIC=your mnemonic phrase
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key (optional)
```

### Frontend Configuration

Create a `.env.local` file in the `frontend` directory:

```env
VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
VITE_INFURA_API_KEY=your_infura_api_key
VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

## Development

### 1. Start Local Hardhat Node with FHEVM

   ```bash
   npx hardhat node
   ```

### 2. Deploy Contract Locally

In a new terminal:

   ```bash
npm run deploy:local
```

Copy the deployed contract address and add it to `frontend/.env.local` as `VITE_CONTRACT_ADDRESS`.

### 3. Run Tests

   ```bash
# Local tests
npm test

# Sepolia testnet tests
npm run test:sepolia
```

### 4. Start Frontend Development Server

   ```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button in the top right corner and connect using Rainbow wallet
2. **Add Hobby Entry**: Fill in the hobby form with:
   - Category (1-5): Sports & Fitness, Arts & Crafts, Music & Entertainment, Reading & Learning, Outdoor & Nature
   - Engagement Level (1-10): How engaged you were in this hobby
   - Enjoyment Level (1-5): How much you enjoyed this hobby activity
3. **View History**: View your encrypted hobby entries
4. **Decrypt Entries**: Click "Decrypt" on any entry to view the decrypted data
5. **Analyze**: View analysis charts showing:
   - Category-enjoyment correlation
   - Engagement and enjoyment trends over time

## Smart Contract

### EncryptedPrivateExpenseLog.sol

The main smart contract that stores encrypted hobby data.

**Key Functions:**
- `addEntry(uint256 date, bytes32 encryptedCategoryHandle, bytes32 encryptedLevelHandle, bytes32 encryptedEmotionHandle)`: Add a new encrypted hobby entry
- `getEntry(address user, uint256 date)`: Get encrypted entry handles for a specific date
- `getEntryCount(address user)`: Get total number of entries for a user
- `getEntryDatesInRange(address user, uint256 startDate, uint256 endDate)`: Get all entry dates in a range

## UI Theme

The application features a vibrant hobby-themed UI with:
- **Gray gradients** for hobby entry forms
- **Slate color scheme** for consistent styling
- **Sports-related icons** for a dynamic, engaging experience

## Deployment

### Local Network

```bash
npm run deploy:local
```

### Sepolia Testnet

```bash
npm run deploy:sepolia
```

## Testing

The project includes comprehensive tests for both local and Sepolia networks:

- `test/EncryptedPrivateExpenseLog.ts`: Local network tests
- `test/EncryptedPrivateExpenseLogSepolia.ts`: Sepolia testnet tests

## License

MIT
