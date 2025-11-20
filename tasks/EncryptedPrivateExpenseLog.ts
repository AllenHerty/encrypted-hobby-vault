import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

task("encrypted-private-expense-log:info", "Get information about EncryptedPrivateExpenseLog contract")
  .addParam("address", "Contract address")
  .addOptionalParam("user", "User address to query")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const contract = await ethers.getContractAt("EncryptedPrivateExpenseLog", taskArgs.address);

    if (taskArgs.user) {
      const entryCount = await contract.getEntryCount(taskArgs.user);
      const lastEntryDate = await contract.getLastEntryDate(taskArgs.user);
      console.log(`User: ${taskArgs.user}`);
      console.log(`Entry Count: ${entryCount}`);
      console.log(`Last Entry Date: ${lastEntryDate}`);
    } else {
      console.log(`Contract Address: ${taskArgs.address}`);
      console.log("Use --user parameter to query specific user data");
    }
  });

