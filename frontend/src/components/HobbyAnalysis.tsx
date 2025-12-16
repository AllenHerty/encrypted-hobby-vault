import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHobbyLog } from "@/hooks/useHobbyLog";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { Trophy, RefreshCw, Target, Zap, TrendingUp, Activity, Lock, BarChart3 } from "lucide-react";
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

  const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'];
  const EMOJIS = ['🏃', '🎨', '🎸', '📚', '🌿'];

  const getCategoryName = (category: number) => {
    const categories = ["", "Sports & Fitness", "Arts & Crafts", "Music & Entertainment", "Reading & Learning", "Outdoor & Nature"];
    return categories[category] || `Category ${category}`;
  };

  const getCategoryShortName = (category: number) => {
    const categories = ["", "Sports", "Arts", "Music", "Reading", "Outdoor"];
    return categories[category] || `Cat${category}`;
  };

  const loadAndAnalyze = async () => {
    if (!isConnected || !CONTRACT_ADDRESS) return;

    try {
      const today = Math.floor(Date.now() / 86400000);
      const startDate = today - 30;
      const allEntries = await getAllEntries(startDate, today);
      setEntries(allEntries);

      const decryptedMap = new Map<number, HobbyEntry>();
      for (const entry of allEntries) {
        try {
          const decrypted = await decryptEntry(entry.date);
          if (decrypted) {
            decryptedMap.set(entry.date, decrypted);
          }
        } catch (error) {
          console.warn(`Failed to decrypt entry for date ${entry.date}:`, error);
        }
      }

      setDecryptedEntries(decryptedMap);
      const decryptedArray = Array.from(decryptedMap.values());

      // Category distribution
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
        totalEntries: decryptedArray.length,
        bestCategory: bestCategory.name,
        bestCategoryScore: bestCategory.score.toFixed(1),
      });

      // Radar chart data
      const radarData = Array.from(categoryStats.entries())
        .map(([category, stats]) => ({
          category: getCategoryShortName(category),
          engagement: (stats.totalEngagement / stats.count).toFixed(1),
          enjoyment: ((stats.totalEnjoyment / stats.count) * 2).toFixed(1),
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

  if (!isConnected) {
    return (
      <Card className="glass-card border-emerald-500/20">
        <CardContent className="p-12">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400">Connect your wallet to view your hobby analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-medium">Analyzing {decryptedEntries.size} entries</p>
            <p className="text-gray-500 text-sm">From {entries.length} total records</p>
          </div>
        </div>
        <Button 
          onClick={loadAndAnalyze} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="glass border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="glass-card border-emerald-500/20">
          <CardContent className="p-12">
            <div className="empty-state">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
              <p className="text-gray-400 mb-4">Add hobby entries to see your analytics</p>
              <div className="flex justify-center gap-3 text-3xl opacity-50">
                <span>📊</span>
                <span>🎯</span>
                <span>🏆</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Metrics Cards */}
          {performanceMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stats-card group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🔥</span>
                  <span className="text-xs text-gray-500">Avg Engagement</span>
                </div>
                <div className="text-3xl font-bold text-gradient-purple">{performanceMetrics.avgEngagement}</div>
                <div className="text-xs text-gray-500 mt-1">out of 10</div>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: `${parseFloat(performanceMetrics.avgEngagement) * 10}%` }} />
                </div>
              </div>

              <div className="stats-card group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">💖</span>
                  <span className="text-xs text-gray-500">Avg Enjoyment</span>
                </div>
                <div className="text-3xl font-bold text-gradient-cyan">{performanceMetrics.avgEnjoyment}</div>
                <div className="text-xs text-gray-500 mt-1">out of 5</div>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} className={`text-sm ${n <= Math.round(parseFloat(performanceMetrics.avgEnjoyment)) ? 'opacity-100' : 'opacity-30'}`}>⭐</span>
                  ))}
                </div>
              </div>

              <div className="stats-card group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">📅</span>
                  <span className="text-xs text-gray-500">Total Sessions</span>
                </div>
                <div className="text-3xl font-bold text-white">{performanceMetrics.totalEntries}</div>
                <div className="text-xs text-gray-500 mt-1">last 30 days</div>
                <div className="flex gap-1 mt-2 opacity-50">
                  {['🏃','🎨','🎸','📚','🌿'].slice(0, Math.min(5, performanceMetrics.totalEntries)).map((e, i) => (
                    <span key={i} className="text-sm">{e}</span>
                  ))}
                </div>
              </div>

              <div className="stats-card group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🏆</span>
                  <span className="text-xs text-gray-500">Top Category</span>
                </div>
                <div className="text-lg font-bold text-gradient-green truncate">{performanceMetrics.bestCategory}</div>
                <div className="text-xs text-gray-500 mt-1">Score: {performanceMetrics.bestCategoryScore}</div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="glass-card border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Category Distribution</h3>
                </div>
                {categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(10, 10, 26, 0.95)', 
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '12px',
                          color: '#e2e8f0'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center py-12">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="glass-card border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Category Performance</h3>
                </div>
                {categoryRadarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={categoryRadarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="category" stroke="#9ca3af" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#9ca3af" />
                      <Radar
                        name="Engagement"
                        dataKey="engagement"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.5}
                      />
                      <Radar
                        name="Enjoyment (×2)"
                        dataKey="enjoyment"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.5}
                      />
                      <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(10, 10, 26, 0.95)', 
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '12px',
                          color: '#e2e8f0'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center py-12">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {categoryDistribution.length > 0 && performanceMetrics && (
            <Card className="glass-card border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Category Breakdown</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryDistribution.map((item, index) => {
                    const percentage = ((item.value / performanceMetrics.totalEntries) * 100).toFixed(1);
                    return (
                      <div key={item.name} className="stats-card hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{EMOJIS[index % EMOJIS.length]}</span>
                            <span className="font-medium text-white">{item.fullName}</span>
                          </div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold text-white">{item.value}</span>
                          <span className="text-sm text-gray-500">entries</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-2 block">{percentage}% of total</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default HobbyAnalysis;
