import { ethers } from "hardhat";

async function main() {
  console.log("Checking contract...");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EncryptedPrivateExpenseLog = await ethers.getContractFactory("EncryptedPrivateExpenseLog");
  const contract = EncryptedPrivateExpenseLog.attach(contractAddress);

  const signers = await ethers.getSigners();
  const alice = signers[1];

  console.log("Contract address:", contractAddress);
  console.log("Alice address:", alice.address);

  // Check entry count
  const count = await contract.getEntryCount(alice.address);
  console.log("Entry count for Alice:", count.toString());

  // Try to call getEntry for a non-existent date
  const date = Math.floor(Date.now() / 86400000);
  console.log("Checking date:", date);

  try {
    const exists = await contract.entryExists(alice.address, date);
    console.log("Entry exists:", exists);

    if (exists) {
      const [categoryHandle, levelHandle, emotionHandle, timestamp] = await contract.getEntry(alice.address, date);
      console.log("Entry data:");
      console.log("- Category handle:", categoryHandle);
      console.log("- Level handle:", levelHandle);
      console.log("- Emotion handle:", emotionHandle);
      console.log("- Timestamp:", timestamp.toString());
    } else {
      console.log("No entry exists for this date");
    }
  } catch (error) {
    console.error("Error calling getEntry:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
