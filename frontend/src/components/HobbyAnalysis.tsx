import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHobbyLog } from "@/hooks/useHobbyLog";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { Trophy, RefreshCw, Target, Zap, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { useChainId } from "wagmi";
import { getContractAddress } from "@/abi/Addresses";

const HobbyAnalysis = () => {
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
  const { getAllEntries, decryptEntry, isLoading } = useHobbyLog(CONTRACT_ADDRESS);
  const [entries, setEntries] = useState<HobbyEntry[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<Map<number, HobbyEntry>>(new Map());
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [categoryRadarData, setCategoryRadarData] = useState<any[]>([]);

  const COLORS = ['#22c55e', '#3b82f6', '#64748b', '#94a3b8', '#cbd5e1'];

  const getCategoryName = (category: number) => {
    const categories = ["", "Sports & Fitness", "Arts & Crafts", "Music & Entertainment", "Reading & Learning", "Outdoor & Nature"];
    return categories[category] || `Category ${category}`;
  };

  const getCategoryShortName = (category: number) => {
    const categories = ["", "Sports", "Arts", "Music", "Reading", "Outdoor"];
    return categories[category] || `Cat${category}`;
  };

  const loadAndAnalyze = async () => {
    if (!isConnected || !CONTRACT_ADDRESS) {
      console.log("Cannot analyze - not connected or no contract address");
      return;
    }

    try {
      console.log("Loading data for analysis...");
      const today = Math.floor(Date.now() / 86400000);
      const startDate = today - 30; // Last 30 days
      console.log("Analysis date range:", startDate, "to", today);
      const allEntries = await getAllEntries(startDate, today);
      console.log("Loaded entries for analysis:", allEntries.length);
      setEntries(allEntries);

      // Decrypt all entries for analysis
      const decryptedMap = new Map<number, HobbyEntry>();
      for (const entry of allEntries) {
        try {
          console.log(`Decrypting entry for date ${entry.date}...`);
          const decrypted = await decryptEntry(entry.date);
          if (decrypted) {
            decryptedMap.set(entry.date, decrypted);
          }
        } catch (error) {
          console.warn(`Failed to decrypt entry for date ${entry.date}:`, error);
        }
      }

      setDecryptedEntries(decryptedMap);
      console.log(`Successfully decrypted ${decryptedMap.size} entries for analysis`);

      // Use decrypted data for analysis
      const decryptedArray = Array.from(decryptedMap.values());

      // Category distribution (pie chart data)
      const categoryCount = new Map<number, number>();
      decryptedArray.forEach((entry) => {
        categoryCount.set(entry.category, (categoryCount.get(entry.category) || 0) + 1);
      });

      const pieData = Array.from(categoryCount.entries())
        .map(([category, count]) => ({
          name: getCategoryShortName(category),
          value: count,
          fullName: getCategoryName(category),
        }))
        .sort((a, b) => b.value - a.value);

      setCategoryDistribution(pieData);

      // Performance metrics
      const totalEngagement = decryptedArray.reduce((sum, e) => sum + e.level, 0);
      const totalEnjoyment = decryptedArray.reduce((sum, e) => sum + e.emotion, 0);
      const avgEngagement = decryptedArray.length > 0 ? (totalEngagement / decryptedArray.length).toFixed(1) : '0';
      const avgEnjoyment = decryptedArray.length > 0 ? (totalEnjoyment / decryptedArray.length).toFixed(1) : '0';
      const maxEngagement = decryptedArray.length > 0 ? Math.max(...decryptedArray.map(e => e.level)) : 0;
      const maxEnjoyment = decryptedArray.length > 0 ? Math.max(...decryptedArray.map(e => e.emotion)) : 0;

      // Find best performing category
      const categoryStats = new Map<number, { totalEngagement: number; totalEnjoyment: number; count: number }>();
      decryptedArray.forEach((entry) => {
        if (!categoryStats.has(entry.category)) {
          categoryStats.set(entry.category, { totalEngagement: 0, totalEnjoyment: 0, count: 0 });
        }
        const stats = categoryStats.get(entry.category)!;
        stats.totalEngagement += entry.level;
        stats.totalEnjoyment += entry.emotion;
        stats.count += 1;
      });

      let bestCategory = { name: "N/A", score: 0 };
      categoryStats.forEach((stats, category) => {
        const avgScore = (stats.totalEngagement / stats.count) * 2 + (stats.totalEnjoyment / stats.count) * 3;
        if (avgScore > bestCategory.score) {
          bestCategory = { name: getCategoryName(category), score: avgScore };
        }
      });

      setPerformanceMetrics({
        avgEngagement,
        avgEnjoyment,
        maxEngagement,
        maxEnjoyment,
        totalEntries: decryptedArray.length,
        bestCategory: bestCategory.name,
        bestCategoryScore: bestCategory.score.toFixed(1),
      });

      // Radar chart data - average engagement and enjoyment per category
      const radarData = Array.from(categoryStats.entries())
        .map(([category, stats]) => ({
          category: getCategoryShortName(category),
          engagement: (stats.totalEngagement / stats.count).toFixed(1),
          enjoyment: ((stats.totalEnjoyment / stats.count) * 2).toFixed(1), // Scale to 0-10 for better visualization
        }))
        .filter(item => item.category !== "");

      setCategoryRadarData(radarData);
    } catch (error) {
      console.error("Error loading analysis:", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadAndAnalyze();
    }
  }, [isConnected]);

  return (
    <Card className="glass-card border-green-500/30 shadow-xl shadow-green-500/10">
      <CardContent className="pt-6 space-y-6">
        {!isConnected ? (
          <p className="text-slate-900 text-center py-8">Please connect your wallet to view analysis</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <div>
                  <p>Found <span className="font-semibold text-slate-900">{entries.length}</span> entries, analyzing <span className="font-semibold text-slate-900">{decryptedEntries.size}</span> decrypted entries</p>
                  {entries.length > decryptedEntries.size && (
                    <p className="text-xs text-orange-400">
                      Some entries couldn't be decrypted for analysis
                    </p>
                  )}
                </div>
              </div>
              <Button 
                onClick={loadAndAnalyze} 
                variant="outline" 
                size="sm" 
                disabled={isLoading}
                className="border-slate-500/30 text-slate-900 hover:bg-slate-100"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh Analysis
              </Button>
            </div>

            {entries.length === 0 ? (
              <p className="text-slate-900 text-center py-12">
                No entries found. Add hobby entries to see analysis.
              </p>
            ) : (
              <div className="space-y-8">
                {/* Performance Metrics Dashboard */}
                {performanceMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-5 backdrop-blur">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        <span className="text-xs text-white">Avg Engagement</span>
                      </div>
                      <div className="text-3xl font-bold text-white">{performanceMetrics.avgEngagement}</div>
                      <div className="text-xs text-white mt-1">out of 10</div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-500/20 to-slate-400/20 border border-slate-500/30 rounded-xl p-5 backdrop-blur">
                      <div className="flex items-center justify-between mb-2">
                        <Zap className="w-5 h-5 text-slate-200" />
                        <span className="text-xs text-slate-200">Avg Enjoyment</span>
                      </div>
                      <div className="text-3xl font-bold text-white">{performanceMetrics.avgEnjoyment}</div>
                      <div className="text-xs text-slate-200 mt-1">out of 5</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-5 backdrop-blur">
                      <div className="flex items-center justify-between mb-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        <span className="text-xs text-blue-200">Total Sessions</span>
                      </div>
                      <div className="text-3xl font-bold text-white">{performanceMetrics.totalEntries}</div>
                      <div className="text-xs text-blue-200 mt-1">last 30 days</div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-500/20 to-slate-400/20 border border-slate-500/30 rounded-xl p-5 backdrop-blur">
                      <div className="flex items-center justify-between mb-2">
                        <Trophy className="w-5 h-5 text-slate-200" />
                        <span className="text-xs text-slate-200">Top Category</span>
                      </div>
                      <div className="text-lg font-bold text-white truncate">{performanceMetrics.bestCategory}</div>
                      <div className="text-xs text-slate-200 mt-1">Score: {performanceMetrics.bestCategoryScore}</div>
                    </div>
                  </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Distribution Pie Chart */}
                  <div className="bg-slate-800/30 rounded-xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Category Distribution</h3>
                    </div>
                    {categoryDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '8px',
                              color: '#e2e8f0'
                            }}
                            formatter={(value: any, name: any, props: any) => [
                              `${value} entries (${props.payload.fullName})`,
                              'Count'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-slate-200 text-center py-12">No data available</p>
                    )}
                  </div>

                  {/* Performance Radar Chart */}
                  <div className="bg-slate-800/30 rounded-xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Category Performance</h3>
                    </div>
                    {categoryRadarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={categoryRadarData}>
                          <PolarGrid stroke="#475569" />
                          <PolarAngleAxis dataKey="category" stroke="#94a3b8" />
                          <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#94a3b8" />
                          <Radar
                            name="Engagement"
                            dataKey="engagement"
                            stroke="#22c55e"
                            fill="#22c55e"
                            fillOpacity={0.6}
                          />
                          <Radar
                            name="Enjoyment (×2)"
                            dataKey="enjoyment"
                            stroke="#94a3b8"
                            fill="#94a3b8"
                            fillOpacity={0.6}
                          />
                          <Legend 
                            wrapperStyle={{ color: '#e2e8f0' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '8px',
                              color: '#e2e8f0'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-slate-200 text-center py-12">No data available</p>
                    )}
                  </div>
                </div>

                {/* Category Details */}
                {categoryDistribution.length > 0 && (
                  <div className="bg-slate-800/30 rounded-xl p-6 border border-green-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      Category Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryDistribution.map((item, index) => {
                        const percentage = ((item.value / performanceMetrics.totalEntries) * 100).toFixed(1);
                        return (
                          <div
                            key={item.name}
                            className="bg-slate-700/30 rounded-lg p-4 border border-green-500/10"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-white">{item.fullName}</span>
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-white">{item.value}</span>
                              <span className="text-sm text-white">entries</span>
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-slate-700/50 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length],
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-200 mt-1 block">{percentage}% of total</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HobbyAnalysis;
