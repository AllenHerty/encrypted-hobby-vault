import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedPrivateExpenseLog } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedPrivateExpenseLogSepolia", function () {
  let signers: Signers;
  let contract: EncryptedPrivateExpenseLog;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const deployment = await deployments.get("EncryptedPrivateExpenseLog");
      contractAddress = deployment.address;
      contract = await ethers.getContractAt("EncryptedPrivateExpenseLog", deployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should add an expense entry and retrieve it", async function () {
    steps = 8;

    this.timeout(4 * 40000);

    const date = Math.floor(Date.now() / 86400000);
    const category = 3;
    const level = 7;
    const emotion = 4;

    progress("Encrypting category...");
    const encryptedCategory = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(category)
      .encrypt();

    progress("Encrypting level...");
    const encryptedLevel = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(level)
      .encrypt();

    progress("Encrypting emotion...");
    const encryptedEmotion = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(emotion)
      .encrypt();

    progress(`Call addEntry() contract=${contractAddress} signer=${signers.alice.address}...`);
    const tx = await contract
      .connect(signers.alice)
      .addEntry(
        date,
        encryptedCategory.handles[0],
        encryptedLevel.handles[0],
        encryptedEmotion.handles[0]
      );
    await tx.wait();

    progress(`Call getEntry()...`);
    const [categoryHandle, levelHandle, emotionHandle, timestamp] = await contract.getEntry(
      signers.alice.address,
      date
    );

    progress(`Decrypting category...`);
    const decryptedCategory = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      categoryHandle,
      contractAddress,
      signers.alice,
    );

    progress(`Decrypting level...`);
    const decryptedLevel = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      levelHandle,
      contractAddress,
      signers.alice,
    );

    progress(`Decrypting emotion...`);
    const decryptedEmotion = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      emotionHandle,
      contractAddress,
      signers.alice,
    );

    progress(`Verifying results...`);
    expect(decryptedCategory).to.eq(category);
    expect(decryptedLevel).to.eq(level);
    expect(decryptedEmotion).to.eq(emotion);
    expect(timestamp).to.be.gt(0);
  });
});

