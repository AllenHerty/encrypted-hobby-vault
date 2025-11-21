import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHobbyLog } from "@/hooks/useHobbyLog";
import { Trophy, Sparkles } from "lucide-react";
import { useChainId } from "wagmi";
import { getContractAddress } from "@/abi/Addresses";

const HobbyEntryForm = () => {
  const chainId = useChainId();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || getContractAddress(chainId);

  const { isConnected } = useAccount();
  const { addEntry, isLoading, message } = useHobbyLog(CONTRACT_ADDRESS);
  const [category, setCategory] = useState("1");
  const [level, setLevel] = useState("1");
  const [emotion, setEmotion] = useState("1");

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

    // Validate required fields
    if (!category || !level || !emotion) {
      alert("Please fill in all fields");
      return;
    }

    // Validate value ranges
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
      const date = Math.floor(Date.now() / 86400000); // Day number since epoch
      await addEntry(
        date,
        parseInt(category),
        parseInt(level),
        parseInt(emotion)
      );
      // Reset form
      setCategory("1");
      setLevel("1");
      setEmotion("1");
    } catch (error: any) {
      console.error("Error adding entry:", error);
      alert(`Failed to add hobby entry: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <Card className="glass-card border-slate-500/30 shadow-xl shadow-slate-500/10">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-900 font-medium">
              Hobby Category
            </Label>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="border-slate-500/30"
            >
              <option value="1">🏃 Sports & Fitness</option>
              <option value="2">🎨 Arts & Crafts</option>
              <option value="3">🎵 Music & Entertainment</option>
              <option value="4">📚 Reading & Learning</option>
              <option value="5">🌲 Outdoor & Nature</option>
            </Select>
            <p className="text-xs text-slate-700">
              Choose the category that best describes your hobby
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level" className="text-slate-900 font-medium">
              Engagement Level (1-10)
            </Label>
            <Select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
              className="border-slate-500/30"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num.toString()}>
                  Level {num} {num <= 3 ? "🟢" : num <= 6 ? "🟡" : "🔴"}
                </option>
              ))}
            </Select>
            <p className="text-xs text-slate-700">
              Rate how deeply engaged you were in this activity
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emotion" className="text-slate-900 font-medium">
              Enjoyment Level (1-5)
            </Label>
            <Select
              id="emotion"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              required
              className="border-slate-500/30"
            >
              <option value="1">⭐ Very Low</option>
              <option value="2">⭐⭐ Low</option>
              <option value="3">⭐⭐⭐ Medium</option>
              <option value="4">⭐⭐⭐⭐ High</option>
              <option value="5">⭐⭐⭐⭐⭐ Very High</option>
            </Select>
            <p className="text-xs text-slate-700">
              How much joy and satisfaction did this activity bring you?
            </p>
          </div>

          {message && (
            <div className={`rounded-xl p-4 backdrop-blur ${
              message.includes("Error") || message.includes("Missing")
                ? "bg-red-500/10 border border-red-500/30"
                : "bg-slate-500/10 border border-slate-500/30"
            }`}>
              <p className={`text-sm ${
                message.includes("Error") || message.includes("Missing")
                  ? "text-red-300"
                  : "text-slate-100"
              }`}>{message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !isConnected}
            className="w-full gap-2 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white shadow-lg shadow-slate-500/50 transition-all duration-200"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Encrypting & Adding...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                {isConnected ? "Add Encrypted Hobby" : "Connect Wallet First"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HobbyEntryForm;


    </Card>
  );
};

export default HobbyEntryForm;


    </Card>
  );
};

export default HobbyEntryForm;

