import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as fs from "fs";
import * as path from "path";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const deployment = await deploy("EncryptedPrivateExpenseLog", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name === "sepolia" ? 5 : 1,
  });

  const contractAddress = deployment.address;
  console.log("\n" + "=".repeat(60));
  console.log(`Contract deployed at: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log("=".repeat(60) + "\n");

  // Update addresses file
  const addressesFile = path.join(__dirname, "../frontend/src/abi/Addresses.ts");
  if (fs.existsSync(addressesFile)) {
    let content = fs.readFileSync(addressesFile, "utf-8");

    const networkKey = network.name === "sepolia" ? "sepolia" : "localhost";
    const regex = new RegExp(`${networkKey}: "0x[a-fA-F0-9]{40}"`, "g");

    if (regex.test(content)) {
      content = content.replace(regex, `${networkKey}: "${contractAddress}"`);
      fs.writeFileSync(addressesFile, content, "utf-8");
      console.log(`✓ Updated ${networkKey} address in frontend/src/abi/Addresses.ts`);
    } else {
      console.log(`⚠ Could not find ${networkKey} address pattern to update`);
    }
  } else {
    console.log(`⚠ Addresses file not found at ${addressesFile}`);
  }

  console.log("\nNext steps:");
  console.log(`1. Update VITE_CONTRACT_ADDRESS in frontend/.env.local to: ${contractAddress}`);
  console.log("2. Test contract connection in frontend");
  console.log("");
};

func.tags = ["EncryptedPrivateExpenseLog"];
export default func;

