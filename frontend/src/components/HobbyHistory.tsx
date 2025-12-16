import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHobbyLog } from "@/hooks/useHobbyLog";
import { Lock, Unlock, RefreshCw, Calendar, Dumbbell, Palette, Music, BookOpen, Trees, Clock } from "lucide-react";
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

  const { isConnected } = useAccount();
  const { entryCount, getAllEntries, decryptEntry, isLoading } = useHobbyLog(CONTRACT_ADDRESS);
  const [entries, setEntries] = useState<HobbyEntry[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<Map<number, HobbyEntry>>(new Map());
  const [loadingDecrypt, setLoadingDecrypt] = useState<Set<number>>(new Set());

  const categoryConfig = [
    { name: "Sports & Fitness", icon: Dumbbell, color: "text-orange-400", bg: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/30", emoji: "🏃" },
    { name: "Arts & Crafts", icon: Palette, color: "text-pink-400", bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", emoji: "🎨" },
    { name: "Music & Entertainment", icon: Music, color: "text-violet-400", bg: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30", emoji: "🎸" },
    { name: "Reading & Learning", icon: BookOpen, color: "text-cyan-400", bg: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30", emoji: "📚" },
    { name: "Outdoor & Nature", icon: Trees, color: "text-emerald-400", bg: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/30", emoji: "🌿" },
  ];

  const loadEntries = async () => {
    if (!isConnected || !CONTRACT_ADDRESS) return;

    try {
      const today = Math.floor(Date.now() / 86400000);
      const startDate = today - 30;
      const allEntries = await getAllEntries(startDate, today);
      allEntries.sort((a, b) => b.date - a.date);
      setEntries(allEntries);
    } catch (error: any) {
      console.error("Error loading entries:", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadEntries();
    }
  }, [isConnected, entryCount]);

  const handleDecrypt = async (date: number) => {
    if (decryptedEntries.has(date)) {
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
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getCategoryInfo = (category: number) => {
    return categoryConfig[category - 1] || categoryConfig[0];
  };

  if (!isConnected) {
    return (
      <Card className="glass-card border-cyan-500/20">
        <CardContent className="p-12">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400">Connect your wallet to view your encrypted hobby history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-cyan-500/20">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-medium">{entryCount} Total Entries</p>
              <p className="text-gray-500 text-sm">Last 30 days</p>
            </div>
          </div>
          <Button 
            onClick={loadEntries} 
            variant="outline" 
            size="sm" 
            disabled={isLoading}
            className="glass border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Entries Yet</h3>
            <p className="text-gray-400 mb-4">Start tracking your hobbies to see them here</p>
            <div className="flex justify-center gap-2 text-2xl opacity-50">
              <span>🏃</span>
              <span>🎨</span>
              <span>🎸</span>
              <span>📚</span>
              <span>🌿</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const decrypted = decryptedEntries.get(entry.date);
              const isDecrypting = loadingDecrypt.has(entry.date);
              const catInfo = decrypted ? getCategoryInfo(decrypted.category) : null;
              const CatIcon = catInfo?.icon || Lock;

              return (
                <div
                  key={entry.date}
                  className={`
                    rounded-xl p-4 transition-all duration-300 card-hover
                    ${decrypted 
                      ? `bg-gradient-to-r ${catInfo?.bg} border ${catInfo?.border}` 
                      : 'glass border border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        ${decrypted 
                          ? `bg-white/10` 
                          : 'bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30'
                        }
                      `}>
                        {decrypted ? (
                          <CatIcon className={`w-5 h-5 ${catInfo?.color}`} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{formatDate(entry.date)}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(entry.timestamp * 1000).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDecrypt(entry.date)}
                      variant="outline"
                      size="sm"
                      disabled={isDecrypting}
                      className={`
                        ${decrypted 
                          ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                          : 'glass border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                        }
                      `}
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

                  {/* Decrypted Content */}
                  {decrypted && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{catInfo?.emoji}</span>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Category</p>
                            <p className={`font-medium ${catInfo?.color}`}>{catInfo?.name}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                            <span>🔥</span> Engagement
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${decrypted.level * 10}%` }}
                              />
                            </div>
                            <span className="text-white font-bold text-sm">{decrypted.level}/10</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                            <span>💖</span> Enjoyment
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span 
                                key={n} 
                                className={`text-lg transition-all duration-200 ${n <= decrypted.emotion ? 'opacity-100' : 'opacity-20'}`}
                              >
                                {n <= decrypted.emotion ? '⭐' : '☆'}
                              </span>
                            ))}
                            <span className="ml-2 text-amber-400 font-medium text-sm">
                              {['', '😐', '🙂', '😊', '😄', '🤩'][decrypted.emotion]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HobbyHistory;
