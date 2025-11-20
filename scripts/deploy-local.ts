import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const EncryptedPrivateExpenseLog = await ethers.getContractFactory("EncryptedPrivateExpenseLog");
  const contract = await EncryptedPrivateExpenseLog.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("EncryptedPrivateExpenseLog deployed to:", address);
  console.log("\nTo use this contract in your frontend, set:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

