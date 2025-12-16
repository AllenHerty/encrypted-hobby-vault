import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useHobbyLog } from "@/hooks/useHobbyLog";
import { Send, Loader2, Lock, Dumbbell, Palette, Music, BookOpen, Trees } from "lucide-react";
import { useChainId } from "wagmi";
import { getContractAddress } from "@/abi/Addresses";

const HobbyEntryForm = () => {
  const chainId = useChainId();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || getContractAddress(chainId);

  const { isConnected } = useAccount();
  const { addEntry, isLoading, message } = useHobbyLog(CONTRACT_ADDRESS);
  const [category, setCategory] = useState("1");
  const [level, setLevel] = useState("5");
  const [emotion, setEmotion] = useState("3");

  const categories = [
    { value: "1", label: "Sports & Fitness", icon: Dumbbell, color: "text-orange-400", emoji: "🏃", bg: "from-orange-500/20 to-amber-500/20" },
    { value: "2", label: "Arts & Crafts", icon: Palette, color: "text-pink-400", emoji: "🎨", bg: "from-pink-500/20 to-rose-500/20" },
    { value: "3", label: "Music & Entertainment", icon: Music, color: "text-violet-400", emoji: "🎸", bg: "from-violet-500/20 to-purple-500/20" },
    { value: "4", label: "Reading & Learning", icon: BookOpen, color: "text-cyan-400", emoji: "📚", bg: "from-cyan-500/20 to-blue-500/20" },
    { value: "5", label: "Outdoor & Nature", icon: Trees, color: "text-emerald-400", emoji: "🌿", bg: "from-emerald-500/20 to-green-500/20" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!CONTRACT_ADDRESS) {
      alert("Contract address not configured");
      return;
    }

    if (!category || !level || !emotion) {
      alert("Please fill in all fields");
      return;
    }

    const categoryNum = parseInt(category);
    const levelNum = parseInt(level);
    const emotionNum = parseInt(emotion);

    if (categoryNum < 1 || categoryNum > 5) {
      alert("Category must be between 1 and 5");
      return;
    }

    if (levelNum < 1 || levelNum > 10) {
      alert("Level must be between 1 and 10");
      return;
    }

    if (emotionNum < 1 || emotionNum > 5) {
      alert("Emotion must be between 1 and 5");
      return;
    }

    try {
      const date = Math.floor(Date.now() / 86400000);
      await addEntry(date, categoryNum, levelNum, emotionNum);
      setCategory("1");
      setLevel("5");
      setEmotion("3");
      alert("Entry added successfully!");
    } catch (error: any) {
      console.error("Error adding entry:", error);
      let errorMessage = "Failed to add entry. Please try again.";
      if (error.message?.includes("Entry already exists")) {
        errorMessage = "You already have an entry for today. Try again tomorrow.";
      } else if (error.message?.includes("Missing requirements")) {
        errorMessage = "FHE requirements not met. Please ensure you have the necessary setup.";
      } else if (error.message?.includes("Invalid")) {
        errorMessage = "Invalid input values. Please check your entries.";
      }
      alert(errorMessage);
    }
  };

  const selectedCategory = categories.find(c => c.value === category);
  const CategoryIcon = selectedCategory?.icon || Dumbbell;

  return (
    <Card className="glass-card border-violet-500/20 card-hover">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection - Visual Cards */}
          <div className="space-y-3">
            <Label className="text-gray-300 font-medium flex items-center gap-2">
              <span className="text-xl">{selectedCategory?.emoji || '🎯'}</span>
              Choose Your Hobby Category
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`
                      p-4 rounded-xl border transition-all duration-300 text-left
                      ${isSelected 
                        ? `bg-gradient-to-br ${cat.bg} border-${cat.color.replace('text-', '')}/50 scale-105 shadow-lg` 
                        : 'glass border-white/10 hover:border-white/20 hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{cat.emoji}</span>
                      <Icon className={`w-5 h-5 ${isSelected ? cat.color : 'text-gray-400'}`} />
                    </div>
                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {cat.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engagement Level */}
          <div className="space-y-3">
            <Label className="text-gray-300 font-medium flex items-center gap-2">
              <span className="text-xl">🔥</span>
              Engagement Level
            </Label>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">😴 Relaxed</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gradient-purple">{level}</span>
                  <span className="text-gray-500">/10</span>
                </div>
                <span className="text-gray-500 text-sm">🔥 Intense</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between mt-2">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <div 
                    key={n} 
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${parseInt(level) >= n ? 'bg-violet-500' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enjoyment Level */}
          <div className="space-y-3">
            <Label className="text-gray-300 font-medium flex items-center gap-2">
              <span className="text-xl">💖</span>
              How Much Did You Enjoy It?
            </Label>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex justify-center gap-3 mb-3">
                {[
                  { num: 1, emoji: '😐', label: 'Meh' },
                  { num: 2, emoji: '🙂', label: 'Okay' },
                  { num: 3, emoji: '😊', label: 'Good' },
                  { num: 4, emoji: '😄', label: 'Great' },
                  { num: 5, emoji: '🤩', label: 'Amazing' },
                ].map((item) => (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => setEmotion(item.num.toString())}
                    className={`
                      flex flex-col items-center p-3 rounded-xl transition-all duration-300
                      ${parseInt(emotion) === item.num 
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 scale-110' 
                        : 'hover:bg-white/10'
                      }
                    `}
                  >
                    <span className={`text-3xl mb-1 ${parseInt(emotion) === item.num ? 'animate-bounce' : ''}`}>
                      {item.emoji}
                    </span>
                    <span className={`text-xs ${parseInt(emotion) === item.num ? 'text-white font-medium' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span 
                      key={num} 
                      className={`text-xl transition-all duration-200 ${parseInt(emotion) >= num ? 'opacity-100 scale-110' : 'opacity-30'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`
              rounded-xl p-4 
              ${message.includes("Error") || message.includes("Missing")
                ? "bg-red-500/10 border border-red-500/30 text-red-300"
                : "bg-violet-500/10 border border-violet-500/30 text-violet-300"
              }
            `}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !isConnected}
            className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/30 transition-all duration-300 btn-shine"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Encrypting & Storing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                {isConnected ? "Add Encrypted Entry" : "Connect Wallet First"}
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
            <span>🔐</span>
            <span>Encrypted with FHE</span>
            <span>•</span>
            <span>🔗</span>
            <span>Stored on-chain</span>
            <span>•</span>
            <span>👁️</span>
            <span>Only you can view</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HobbyEntryForm;
