import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function checkSepoliaDeployment() {
  console.log("🔍 Checking Sepolia testnet deployment...\n");

  // Read deployment file
  const deploymentPath = path.join(__dirname, "../deployments/sepolia/EncryptedPrivateExpenseLog.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.log("❌ Deployment file not found!");
    console.log("   Path:", deploymentPath);
    console.log("\n💡 To deploy to Sepolia, run:");
    console.log("   npm run deploy:sepolia");
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const contractAddress = deployment.address;

  console.log("✅ Deployment file found!");
  console.log("   Contract Address:", contractAddress);
  
  if (deployment.receipt) {
    console.log("   Transaction Hash:", deployment.receipt.transactionHash);
    console.log("   Block Number:", deployment.receipt.blockNumber);
  }

  // Check if we have network config
  const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
  
  if (!INFURA_API_KEY) {
    console.log("\n⚠️  INFURA_API_KEY not set. Cannot verify on-chain.");
    console.log("   Set INFURA_API_KEY in your environment or .env file");
    return;
  }

  try {
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(
      `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
    );

    console.log("\n🌐 Connecting to Sepolia testnet...");
    
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    
    if (code === "0x") {
      console.log("❌ Contract NOT found on Sepolia!");
      console.log("   The address exists but has no code.");
      console.log("   This means the contract was not deployed or was self-destructed.");
      console.log("\n💡 To deploy, run:");
      console.log("   npm run deploy:sepolia");
    } else {
      console.log("✅ Contract EXISTS on Sepolia!");
      console.log("   Code length:", code.length, "characters");
      
      // Get block number
      const blockNumber = await provider.getBlockNumber();
      console.log("   Current Sepolia block:", blockNumber);
      
      // Try to get contract info
      try {
        const balance = await provider.getBalance(contractAddress);
        console.log("   Contract balance:", ethers.formatEther(balance), "ETH");
      } catch (e) {
        // Ignore
      }

      console.log("\n🔗 View on Etherscan:");
      console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
    }
  } catch (error: any) {
    console.log("\n❌ Error checking contract:");
    console.log("   ", error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. INFURA_API_KEY is set correctly");
    console.log("   2. You have internet connection");
    console.log("   3. Sepolia RPC endpoint is accessible");
  }
}

checkSepoliaDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

