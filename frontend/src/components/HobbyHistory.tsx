import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHobbyLog } from "@/hooks/useHobbyLog";
import { Lock, Unlock, RefreshCw, Activity } from "lucide-react";
import { useChainId } from "wagmi";
import { getContractAddress } from "@/abi/Addresses";

const HobbyHistory = () => {
  const chainId = useChainId();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || getContractAddress(chainId);

interface HobbyEntry {
  date: number;
  category: number;
  level: number;
  emotion: number;
  timestamp: number;
}

  const { isConnected, address } = useAccount();
  const { entryCount, getAllEntries, decryptEntry, isLoading, message } = useHobbyLog(CONTRACT_ADDRESS);
  const [entries, setEntries] = useState<HobbyEntry[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<Map<number, HobbyEntry>>(new Map());
  const [loadingDecrypt, setLoadingDecrypt] = useState<Set<number>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadEntries = async () => {
    if (!isConnected || !CONTRACT_ADDRESS) {
      console.log("Cannot load entries - not connected or no contract address");
      return;
    }

    try {
      console.log("Loading entries for last 30 days...");
      const today = Math.floor(Date.now() / 86400000);
      const startDate = today - 30; // Last 30 days
      console.log("Date range:", startDate, "to", today);

      // Add loading state management
      setEntries([]); // Clear previous entries while loading
      const allEntries = await getAllEntries(startDate, today);
      console.log("Loaded entries:", allEntries.length);

      // Sort entries by date (most recent first)
      allEntries.sort((a, b) => b.date - a.date);

      setEntries(allEntries);
      setLastRefresh(new Date());
    } catch (error: any) {
      console.error("Error loading entries:", error);
      // Better error handling with user feedback
      if (error.message?.includes("Missing requirements")) {
        console.warn("FHE requirements not met - some features may be unavailable");
      } else {
        // Show user-friendly error message
        alert("Failed to load entries. Please check your connection and try again.");
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadEntries();
    }
  }, [isConnected, entryCount]);

  const handleDecrypt = async (date: number) => {
    if (decryptedEntries.has(date)) {
      // Already decrypted, remove it
      const newMap = new Map(decryptedEntries);
      newMap.delete(date);
      setDecryptedEntries(newMap);
      return;
    }

    setLoadingDecrypt(new Set([...loadingDecrypt, date]));
    try {
      const entry = await decryptEntry(date);
      if (entry) {
        setDecryptedEntries(new Map(decryptedEntries.set(date, entry)));
      }
    } catch (error) {
      console.error("Error decrypting entry:", error);
    } finally {
      const newSet = new Set(loadingDecrypt);
      newSet.delete(date);
      setLoadingDecrypt(newSet);
    }
  };

  const formatDate = (date: number) => {
    const dateObj = new Date(date * 86400000);
    return dateObj.toLocaleDateString();
  };

  const getCategoryName = (category: number) => {
    const categories = ["", "Sports & Fitness", "Arts & Crafts", "Music & Entertainment", "Reading & Learning", "Outdoor & Nature"];
    return categories[category] || `Category ${category}`;
  };

  const getEmotionStars = (emotion: number) => {
    return "⭐".repeat(emotion);
  };

  return (
    <Card className="glass-card border-blue-500/30 shadow-xl shadow-blue-500/10">
      <CardContent className="pt-6 space-y-4">
        {!isConnected ? (
              <p className="text-slate-900 text-center py-8">Please connect your wallet to view entries</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total entries: <span className="font-semibold text-slate-900">{entryCount}</span>
              </p>
              <Button 
                onClick={loadEntries} 
                variant="outline" 
                size="sm" 
                disabled={isLoading}
                className="border-slate-500/30 text-slate-900 hover:bg-slate-100"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {message && (
              <div className={`rounded-xl p-4 backdrop-blur ${
                message.includes("Error")
                  ? "bg-red-500/10 border border-red-500/30"
                  : "bg-blue-500/10 border border-blue-500/30"
              }`}>
                <p className={`text-sm ${
                  message.includes("Error")
                    ? "text-red-300"
                    : "text-blue-200"
                }`}>{message}</p>
              </div>
            )}

            {entries.length === 0 ? (
              <p className="text-slate-900 text-center py-12">
                No entries found. Add your first hobby entry to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => {
                  const decrypted = decryptedEntries.get(entry.date);
                  const isDecrypting = loadingDecrypt.has(entry.date);

                  return (
                    <div
                      key={entry.date}
                      className="border border-blue-500/20 rounded-xl p-4 space-y-3 bg-slate-800/30 backdrop-blur hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-100">Date: {formatDate(entry.date)}</p>
                          <p className="text-xs text-slate-300">
                            {new Date(entry.timestamp * 1000).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDecrypt(entry.date)}
                          variant="outline"
                          size="sm"
                          disabled={isDecrypting}
                          className="border-blue-500/30 text-blue-200 hover:bg-blue-500/10"
                        >
                          {decrypted ? (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              {isDecrypting ? "Decrypting..." : "Decrypt"}
                            </>
                          )}
                        </Button>
                      </div>
                      {decrypted && (
                        <div className="mt-2 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl space-y-2 backdrop-blur">
                          <p className="text-sm text-blue-100">
                            <span className="font-semibold text-blue-200">Category:</span> {getCategoryName(decrypted.category)}
                          </p>
                          <p className="text-sm text-blue-100">
                            <span className="font-semibold text-blue-200">Engagement Level:</span> {decrypted.level}/10
                          </p>
                          <p className="text-sm text-blue-100">
                            <span className="font-semibold text-blue-200">Enjoyment:</span> {getEmotionStars(decrypted.emotion)} ({decrypted.emotion}/5)
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HobbyHistory;





