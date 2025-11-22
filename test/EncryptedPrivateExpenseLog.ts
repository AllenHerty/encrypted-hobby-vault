import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedPrivateExpenseLog, EncryptedPrivateExpenseLog__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedPrivateExpenseLog")) as EncryptedPrivateExpenseLog__factory;
  const contract = (await factory.deploy()) as EncryptedPrivateExpenseLog;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("EncryptedPrivateExpenseLog", function () {
  let signers: Signers;
  let contract: EncryptedPrivateExpenseLog;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should return 0 entry count for new user", async function () {
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(0);
  });

  it("should prevent duplicate entries for the same date", async function () {
    const date = Math.floor(Date.now() / 86400000); // Day number
    const category = 3;
    const level = 7;
    const emotion = 4;

    // Add first entry
    await contract.connect(signers.alice).addEntry(
      date,
      await fhevm.createEncryptedInput(contractAddress, signers.alice.address, category),
      await fhevm.createEncryptedInput(contractAddress, signers.alice.address, level),
      await fhevm.createEncryptedInput(contractAddress, signers.alice.address, emotion)
    );

    // Try to add duplicate entry - should fail
    await expect(
      contract.connect(signers.alice).addEntry(
        date,
        await fhevm.createEncryptedInput(contractAddress, signers.alice.address, category),
        await fhevm.createEncryptedInput(contractAddress, signers.alice.address, level),
        await fhevm.createEncryptedInput(contractAddress, signers.alice.address, emotion)
      )
    ).to.be.revertedWith("Entry already exists for this date");
  });

  it("should add an expense entry and retrieve it", async function () {
    const date = Math.floor(Date.now() / 86400000); // Day number
    const category = 3; // Category 1-5
    const level = 7; // Level 1-10
    const emotion = 4; // Emotion 1-5

    // Encrypt the values
    const encryptedCategory = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(category)
      .encrypt();

    const encryptedLevel = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(level)
      .encrypt();

    const encryptedEmotion = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(emotion)
      .encrypt();

    // Add entry
    const tx = await contract
      .connect(signers.alice)
      .addEntry(
        date,
        encryptedCategory.handles[0],
        encryptedLevel.handles[0],
        encryptedEmotion.handles[0]
      );
    await tx.wait();

    // Verify entry count
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(1);
    expect(await contract.entryExists(signers.alice.address, date)).to.be.true;

    // Retrieve and decrypt entry
    const [categoryHandle, levelHandle, emotionHandle, timestamp] = await contract.getEntry(
      signers.alice.address,
      date
    );

    // Decrypt values (wait for permissions to be set)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const decryptedCategory = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      categoryHandle,
      contractAddress,
      signers.alice,
    );

    const decryptedLevel = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      levelHandle,
      contractAddress,
      signers.alice,
    );

    const decryptedEmotion = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      emotionHandle,
      contractAddress,
      signers.alice,
    );

    expect(decryptedCategory).to.eq(category);
    expect(decryptedLevel).to.eq(level);
    expect(decryptedEmotion).to.eq(emotion);
    expect(timestamp).to.be.gt(0);
  });

  it("should add multiple entries for the same user", async function () {
    const date1 = Math.floor(Date.now() / 86400000);
    const date2 = date1 + 1;

    // First entry
    const encryptedCategory1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(2)
      .encrypt();
    const encryptedLevel1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(5)
      .encrypt();
    const encryptedEmotion1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(3)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .addEntry(
        date1,
        encryptedCategory1.handles[0],
        encryptedLevel1.handles[0],
        encryptedEmotion1.handles[0]
      );
    await tx.wait();

    // Second entry
    const encryptedCategory2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(4)
      .encrypt();
    const encryptedLevel2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(8)
      .encrypt();
    const encryptedEmotion2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(5)
      .encrypt();

    tx = await contract
      .connect(signers.alice)
      .addEntry(
        date2,
        encryptedCategory2.handles[0],
        encryptedLevel2.handles[0],
        encryptedEmotion2.handles[0]
      );
    await tx.wait();

    // Verify entry count
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(2);
    expect(await contract.getLastEntryDate(signers.alice.address)).to.eq(date2);
  });

  it("should keep separate entries for different users", async function () {
    const date = Math.floor(Date.now() / 86400000);

    // Alice's entry
    const encryptedCategoryAlice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(1)
      .encrypt();
    const encryptedLevelAlice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(3)
      .encrypt();
    const encryptedEmotionAlice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(2)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .addEntry(
        date,
        encryptedCategoryAlice.handles[0],
        encryptedLevelAlice.handles[0],
        encryptedEmotionAlice.handles[0]
      );
    await tx.wait();

    // Bob's entry
    const encryptedCategoryBob = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add8(5)
      .encrypt();
    const encryptedLevelBob = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add8(10)
      .encrypt();
    const encryptedEmotionBob = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add8(5)
      .encrypt();

    tx = await contract
      .connect(signers.bob)
      .addEntry(
        date,
        encryptedCategoryBob.handles[0],
        encryptedLevelBob.handles[0],
        encryptedEmotionBob.handles[0]
      );
    await tx.wait();

    // Verify separate counts
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(1);
    expect(await contract.getEntryCount(signers.bob.address)).to.eq(1);
    expect(await contract.entryExists(signers.alice.address, date)).to.be.true;
    expect(await contract.entryExists(signers.bob.address, date)).to.be.true;
  });
});

