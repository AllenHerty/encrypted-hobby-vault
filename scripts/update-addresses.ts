import * as fs from "fs";
import * as path from "path";

/**
 * Update contract addresses in frontend/abi/Addresses.ts
 * This script should be run after deployment
 */
async function updateAddresses() {
  const network = process.env.NETWORK || "localhost";
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("Error: CONTRACT_ADDRESS environment variable is not set");
    process.exit(1);
  }

  const addressesFile = path.join(__dirname, "../frontend/src/abi/Addresses.ts");
  
  // Read current file
  let content = fs.readFileSync(addressesFile, "utf-8");

  // Update address based on network
  if (network === "sepolia") {
    content = content.replace(
      /sepolia: "0x[a-fA-F0-9]{40}"/,
      `sepolia: "${contractAddress}"`
    );
  } else if (network === "localhost" || network === "hardhat" || network === "anvil") {
    content = content.replace(
      /localhost: "0x[a-fA-F0-9]{40}"/,
      `localhost: "${contractAddress}"`
    );
  }

  // Write updated file
  fs.writeFileSync(addressesFile, content, "utf-8");
  
  console.log(`✓ Updated ${network} contract address to ${contractAddress}`);
}

updateAddresses().catch((error) => {
  console.error("Error updating addresses:", error);
  process.exit(1);
});

