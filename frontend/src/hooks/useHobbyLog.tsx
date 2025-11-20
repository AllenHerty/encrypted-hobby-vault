import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { getContractAddress } from "@/abi/Addresses";

// Contract ABI
const EncryptedPrivateExpenseLogABI = [
  "function addEntry(uint256 date, bytes32 encryptedCategory, bytes categoryProof, bytes32 encryptedLevel, bytes levelProof, bytes32 encryptedEmotion, bytes emotionProof) external",
  "function getEntry(address user, uint256 date) external view returns (uint256 category, uint256 level, uint256 emotion, uint256 timestamp)",
  "function getEntryCount(address user) external view returns (uint256)",
  "function getLastEntryDate(address user) external view returns (uint256)",
  "function entryExists(address user, uint256 date) external view returns (bool)",
  "function getEntryDatesInRange(address user, uint256 startDate, uint256 endDate) external view returns (uint256[] memory)",
  "event EntryAdded(address indexed user, uint256 date, uint256 timestamp)",
] as const;

interface HobbyEntry {
  date: number;
  category: number;
  level: number;
  emotion: number;
  timestamp: number;
}

interface UseHobbyLogState {
  contractAddress: string | undefined;
  entryCount: number;
  isLoading: boolean;
  message: string | undefined;
  addEntry: (date: number, category: number, level: number, emotion: number) => Promise<void>;
  getEntry: (date: number) => Promise<HobbyEntry | null>;
  getAllEntries: (startDate: number, endDate: number) => Promise<HobbyEntry[]>;
  decryptEntry: (date: number) => Promise<HobbyEntry | null>;
}

export function useHobbyLog(contractAddress: string | undefined): UseHobbyLogState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  
  // Fallback to address from Addresses.ts if contractAddress is not provided
  const finalContractAddress = contractAddress || getContractAddress(chainId) || import.meta.env.VITE_CONTRACT_ADDRESS;

  const [entryCount, setEntryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersProvider, setEthersProvider] = useState<ethers.JsonRpcProvider | undefined>(undefined);

  // Get EIP1193 provider
  const eip1193Provider = useCallback(() => {
    if (chainId === 31337) {
      return "http://localhost:8545";
    }
    if (walletClient?.transport) {
      const transport = walletClient.transport as any;
      if (transport.value && typeof transport.value.request === "function") {
        return transport.value;
      }
      if (typeof transport.request === "function") {
        return transport;
      }
    }
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return undefined;
  }, [chainId, walletClient]);

  // Initialize FHEVM
  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider: eip1193Provider(),
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && !!finalContractAddress,
  });

  // Convert walletClient to ethers signer
  useEffect(() => {
    if (!walletClient || !chainId) {
      setEthersSigner(undefined);
      setEthersProvider(undefined);
      return;
    }

    const setupEthers = async () => {
      try {
        const provider = new ethers.BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        setEthersProvider(provider as any);
        setEthersSigner(signer);
      } catch (error) {
        console.error("Error setting up ethers:", error);
        setEthersSigner(undefined);
        setEthersProvider(undefined);
      }
    };

    setupEthers();
  }, [walletClient, chainId]);

  // Load entry count
  const loadEntryCount = useCallback(async () => {
    if (!finalContractAddress || !ethersProvider || !address) {
      return;
    }

    try {
      const contract = new ethers.Contract(finalContractAddress, EncryptedPrivateExpenseLogABI, ethersProvider);
      const count = await contract.getEntryCount(address);
      setEntryCount(Number(count));
    } catch (error: any) {
      console.error("Error loading entry count:", error);
    }
  }, [finalContractAddress, ethersProvider, address]);

  useEffect(() => {
    if (finalContractAddress && ethersProvider && address) {
      loadEntryCount();
    }
  }, [finalContractAddress, ethersProvider, address, loadEntryCount]);

  const addEntry = useCallback(
    async (date: number, category: number, level: number, emotion: number) => {
      if (!finalContractAddress || !ethersSigner || !fhevmInstance || !address) {
        throw new Error("Missing requirements for adding entry");
      }

      if (category < 1 || category > 5) {
        throw new Error("Category must be between 1 and 5");
      }
      if (level < 1 || level > 10) {
        throw new Error("Level must be between 1 and 10");
      }
      if (emotion < 1 || emotion > 5) {
        throw new Error("Emotion must be between 1 and 5");
      }

      try {
        setIsLoading(true);
        setMessage("Encrypting hobby data...");

        // Use FHEVM encryption for all networks (including local testing)
        if (!fhevmInstance) {
          throw new Error("FHEVM instance not available");
        }

        // Encrypt values using FHEVM
        const encryptedCategoryInput = fhevmInstance.createEncryptedInput(
          finalContractAddress as `0x${string}`,
          address as `0x${string}`
        );
        encryptedCategoryInput.add8(category);
        const encryptedCategoryResult = await encryptedCategoryInput.encrypt();

        const encryptedLevelInput = fhevmInstance.createEncryptedInput(
          finalContractAddress as `0x${string}`,
          address as `0x${string}`
        );
        encryptedLevelInput.add8(level);
        const encryptedLevelResult = await encryptedLevelInput.encrypt();

        const encryptedEmotionInput = fhevmInstance.createEncryptedInput(
          finalContractAddress as `0x${string}`,
          address as `0x${string}`
        );
        encryptedEmotionInput.add8(emotion);
        const encryptedEmotionResult = await encryptedEmotionInput.encrypt();

        setMessage("Submitting to blockchain...");

        // Call contract with externalEuint8 values and their respective input proofs
        const contract = new ethers.Contract(finalContractAddress, EncryptedPrivateExpenseLogABI, ethersSigner);

        const tx = await contract.addEntry(
          date,
          encryptedCategoryResult.handles[0], // externalEuint8 value for category (already correct format)
          encryptedCategoryResult.inputProof,  // proof for category
          encryptedLevelResult.handles[0],     // externalEuint8 value for level
          encryptedLevelResult.inputProof,     // proof for level
          encryptedEmotionResult.handles[0],   // externalEuint8 value for emotion
          encryptedEmotionResult.inputProof,   // proof for emotion
          { gasLimit: 5000000 }
        );
        await tx.wait();

        setMessage("Entry added successfully!");
        await loadEntryCount();
      } catch (error: any) {
        const errorMessage = error.reason || error.message || String(error);
        setMessage(`Error: ${errorMessage}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [finalContractAddress, ethersSigner, fhevmInstance, address, loadEntryCount]
  );

  const decryptEntry = useCallback(
    async (date: number): Promise<HobbyEntry | null> => {
      if (!finalContractAddress || !ethersProvider || !fhevmInstance || !ethersSigner || !address) {
        throw new Error("Missing requirements for decryption");
      }

      try {
        setIsLoading(true);
        setMessage("Fetching encrypted entry...");

        const contract = new ethers.Contract(finalContractAddress, EncryptedPrivateExpenseLogABI, ethersProvider);
        const exists = await contract.entryExists(address, date);
        if (!exists) {
          return null;
        }

        // Get the encrypted data from contract (returns euint8 values as uint256)
        const [categoryValue, levelValue, emotionValue, timestamp] = await contract.getEntry(address, date);

        console.log("[useHobbyLog] ===== Decryption Debug Info =====");
        console.log("[useHobbyLog] Category value:", categoryValue.toString());
        console.log("[useHobbyLog] Level value:", levelValue.toString());
        console.log("[useHobbyLog] Emotion value:", emotionValue.toString());
        console.log("[useHobbyLog] Contract address:", finalContractAddress);
        console.log("[useHobbyLog] User address:", address);
        console.log("[useHobbyLog] Chain ID:", chainId);

        setMessage("Decrypting entry...");

        // Use userDecryptEuint method for direct euint8 decryption
        try {
          const categoryDecrypted = await (fhevmInstance as any).userDecryptEuint(
            "euint8",
            categoryValue,
            finalContractAddress,
            address as `0x${string}`
          );
          const levelDecrypted = await (fhevmInstance as any).userDecryptEuint(
            "euint8",
            levelValue,
            finalContractAddress,
            address as `0x${string}`
          );
          const emotionDecrypted = await (fhevmInstance as any).userDecryptEuint(
            "euint8",
            emotionValue,
            finalContractAddress,
            address as `0x${string}`
          );

          const category = Number(categoryDecrypted);
          const level = Number(levelDecrypted);
          const emotion = Number(emotionDecrypted);

          console.log("[useHobbyLog] Decryption successful:", { category, level, emotion });
          setMessage("Decryption successful!");
          return {
            date,
            category,
            level,
            emotion,
            timestamp: Number(timestamp),
          };
        } catch (directError: any) {
          console.warn("[useHobbyLog] Direct euint8 decryption failed, trying handle-based decryption:", directError);

          // Fallback to handle-based decryption
          // Convert uint256 values to handles for FHEVM decryption
          const categoryHandle = ethers.zeroPadValue(ethers.toBeHex(categoryValue), 32);
          const levelHandle = ethers.zeroPadValue(ethers.toBeHex(levelValue), 32);
          const emotionHandle = ethers.zeroPadValue(ethers.toBeHex(emotionValue), 32);

          // Prepare handle-contract pairs for decryption
          const handleContractPairs = [
            { handle: categoryHandle, contractAddress: finalContractAddress as `0x${string}` },
            { handle: levelHandle, contractAddress: finalContractAddress as `0x${string}` },
            { handle: emotionHandle, contractAddress: finalContractAddress as `0x${string}` },
          ];

          // Generate keypair for EIP712 signature (fallback)
          let fallbackKeypair: { publicKey: Uint8Array; privateKey: Uint8Array };
          if (typeof (fhevmInstance as any).generateKeypair === "function") {
            fallbackKeypair = (fhevmInstance as any).generateKeypair();
          } else {
            fallbackKeypair = {
              publicKey: new Uint8Array(32).fill(0),
              privateKey: new Uint8Array(32).fill(0),
            };
          }

          // Create EIP712 signature for decryption (fallback)
          const fallbackContractAddresses = [finalContractAddress as `0x${string}`];
          const fallbackStartTimestamp = Math.floor(Date.now() / 1000).toString();
          const fallbackDurationDays = "10";

          let fallbackEip712: any;
          if (typeof (fhevmInstance as any).createEIP712 === "function") {
            fallbackEip712 = (fhevmInstance as any).createEIP712(
              fallbackKeypair.publicKey,
              fallbackContractAddresses,
              fallbackStartTimestamp,
              fallbackDurationDays
            );
          } else {
            fallbackEip712 = {
              domain: {
                name: "FHEVM",
                version: "1",
                chainId: chainId,
                verifyingContract: fallbackContractAddresses[0],
              },
              types: {
                UserDecryptRequestVerification: [
                  { name: "publicKey", type: "bytes" },
                  { name: "contractAddresses", type: "address[]" },
                  { name: "startTimestamp", type: "string" },
                  { name: "durationDays", type: "string" },
                ],
              },
              message: {
                publicKey: ethers.hexlify(fallbackKeypair.publicKey),
                contractAddresses: fallbackContractAddresses,
                startTimestamp: fallbackStartTimestamp,
                durationDays: fallbackDurationDays,
              },
            };
          }

          // Sign the EIP712 message (fallback)
          const fallbackSignature = await ethersSigner.signTypedData(
            fallbackEip712.domain,
            { UserDecryptRequestVerification: fallbackEip712.types.UserDecryptRequestVerification },
            fallbackEip712.message
          );

          // For local mock network, signature may need to have "0x" prefix removed
          const fallbackSignatureForDecrypt = chainId === 31337
            ? fallbackSignature.replace("0x", "")
            : fallbackSignature;

        console.log("[useHobbyLog] Decrypting with fallback method:", {
          handles: [categoryHandle, levelHandle, emotionHandle],
          contractAddress: finalContractAddress,
          userAddress: address,
          chainId,
          signatureLength: fallbackSignature.length,
          signatureForDecryptLength: fallbackSignatureForDecrypt.length,
        });

        // Decrypt using userDecrypt method
        const decryptedResult = await (fhevmInstance as any).userDecrypt(
          handleContractPairs,
          fallbackKeypair.privateKey,
          fallbackKeypair.publicKey,
          fallbackSignatureForDecrypt,
          fallbackContractAddresses,
          address as `0x${string}`,
          fallbackStartTimestamp,
          fallbackDurationDays
        );

        const category = Number(decryptedResult[categoryHandle] || 0);
        const level = Number(decryptedResult[levelHandle] || 0);
        const emotion = Number(decryptedResult[emotionHandle] || 0);

          console.log("[useHobbyLog] Fallback decryption successful:", { category, level, emotion });
          setMessage("Decryption successful!");
          return {
            date,
            category,
            level,
            emotion,
            timestamp: Number(timestamp),
          };
        }
      } catch (error: any) {
        console.error("[useHobbyLog] Error decrypting entry:", error);
        const errorMessage = error.message || String(error);

        // Provide more helpful error messages
        if (errorMessage.includes("not authorized") || errorMessage.includes("authorized")) {
          setMessage(`Decryption failed: You don't have permission to decrypt this handle. This may happen if:
1. The contract was redeployed and the handle is from an old deployment
2. You haven't added entries yet
3. The transaction hasn't fully confirmed yet

Please try:
1. Add entries again to get new handles with proper permissions
2. Wait a few seconds after adding entries before decrypting
3. Refresh the page and try again`);
        } else {
          setMessage(`Error decrypting: ${errorMessage}`);
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [finalContractAddress, ethersProvider, fhevmInstance, ethersSigner, address, chainId]
  );

  const getEntry = useCallback(
    async (date: number): Promise<HobbyEntry | null> => {
      return decryptEntry(date);
    },
    [decryptEntry]
  );

  const getAllEntries = useCallback(
    async (startDate: number, endDate: number): Promise<HobbyEntry[]> => {
      if (!finalContractAddress || !address) {
        console.log("Missing requirements for getting all entries:", {
          finalContractAddress,
          address
        });
        return [];
      }

      try {
        // Create a minimal provider just for reading dates
        const minimalProvider = chainId === 31337
          ? new ethers.JsonRpcProvider("http://localhost:8545")
          : ethersProvider;

        if (!minimalProvider) {
          console.log("No provider available for reading dates");
          return [];
        }

        const contract = new ethers.Contract(finalContractAddress, EncryptedPrivateExpenseLogABI, minimalProvider);
        const dates = await contract.getEntryDatesInRange(address, startDate, endDate);
        console.log("Found dates:", dates);

        const entries: HobbyEntry[] = [];

        // Get real encrypted entries from contract
        console.log("Found dates:", dates.map((d: any) => d.toString()));
        for (const date of dates) {
          const dateNum = Number(date);
          try {
            // Get the encrypted entry from contract
            const [categoryValue, levelValue, emotionValue, timestamp] = await contract.getEntry(address, dateNum);

            // Create entry with encrypted values (will be decrypted later for analysis)
            const entry: HobbyEntry = {
              date: dateNum,
              category: Number(categoryValue), // Keep as encrypted value for now
              level: Number(levelValue),
              emotion: Number(emotionValue),
              timestamp: Number(timestamp),
            };
            entries.push(entry);
          } catch (error) {
            console.warn(`Failed to get entry for date ${dateNum}:`, error);
            // Skip this entry if we can't read it
          }
        }

        console.log("Successfully loaded", entries.length, "entries");
        return entries;
      } catch (error: any) {
        console.error("Error getting all entries:", error);
        return [];
      }
    },
    [finalContractAddress, address, chainId, ethersProvider]
  );

  return {
    contractAddress: finalContractAddress,
    entryCount,
    isLoading,
    message,
    addEntry,
    getEntry,
    getAllEntries,
    decryptEntry,
  };
}

