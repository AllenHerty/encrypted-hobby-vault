import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './lib/wagmi';
import HobbyEntryForm from "./components/HobbyEntryForm";
import HobbyHistory from "./components/HobbyHistory";
import HobbyAnalysis from "./components/HobbyAnalysis";
import WalletConnect from "./components/WalletConnect";
import Logo from "./components/Logo";
import { Plus, History, BarChart3, Shield, Lock, Sparkles, Heart, Gamepad2, Camera, Bike, Coffee } from "lucide-react";
import "./App.css";

const queryClient = new QueryClient();

// Floating hobby emojis component
const FloatingEmojis = () => {
  const emojis = ['🎨', '🎸', '📚', '🏃', '🎮', '🌿', '🎭', '📷', '🎯', '🧘', '🎪', '🎲'];
  
  return (
    <div className="floating-emojis">
      {emojis.map((emoji, index) => (
        <span 
          key={index} 
          className="floating-emoji"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon: Icon, emoji, title, description, gradient }: any) => (
  <div className={`feature-card glass-card p-6 rounded-2xl border border-white/10 hover:border-violet-500/30 transition-all duration-300 card-hover`}>
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
      {emoji ? <span className="text-2xl">{emoji}</span> : <Icon className="w-7 h-7 text-white" />}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

// Hobby showcase component
const HobbyShowcase = () => {
  const hobbies = [
    { emoji: '🏃', name: 'Running', color: 'from-orange-500 to-red-500' },
    { emoji: '🎨', name: 'Painting', color: 'from-pink-500 to-rose-500' },
    { emoji: '🎸', name: 'Music', color: 'from-violet-500 to-purple-500' },
    { emoji: '📚', name: 'Reading', color: 'from-cyan-500 to-blue-500' },
    { emoji: '🌿', name: 'Gardening', color: 'from-emerald-500 to-green-500' },
    { emoji: '🎮', name: 'Gaming', color: 'from-indigo-500 to-violet-500' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {hobbies.map((hobby, index) => (
        <div 
          key={hobby.name}
          className={`hobby-pill flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${hobby.color} bg-opacity-20 border border-white/10 hover:scale-105 transition-transform duration-300`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <span className="text-xl">{hobby.emoji}</span>
          <span className="text-white text-sm font-medium">{hobby.name}</span>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'history' | 'analysis'>('add');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayTab, setDisplayTab] = useState<'add' | 'history' | 'analysis'>('add');

  const handleTabChange = (newTab: 'add' | 'history' | 'analysis') => {
    if (newTab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setDisplayTab(newTab);
      setActiveTab(newTab);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  const tabs = [
    { id: 'add' as const, label: 'Add Hobby', icon: Plus, emoji: '✨', gradient: 'from-violet-500 to-purple-600' },
    { id: 'history' as const, label: 'History', icon: History, emoji: '📜', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'analysis' as const, label: 'Analysis', icon: BarChart3, emoji: '📊', gradient: 'from-emerald-500 to-green-600' },
  ];

  const features = [
    { icon: Lock, emoji: '🔐', title: 'End-to-End Encrypted', description: 'Your hobby data is encrypted using FHE before storing on-chain', gradient: 'from-violet-500/20 to-purple-500/20' },
    { icon: Shield, emoji: '🛡️', title: 'Privacy Preserved', description: 'Only you can decrypt and view your personal records', gradient: 'from-cyan-500/20 to-blue-500/20' },
    { icon: Sparkles, emoji: '✨', title: 'Smart Analytics', description: 'Discover patterns in your hobby engagement privately', gradient: 'from-emerald-500/20 to-green-500/20' },
  ];

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          locale="en-US"
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#8b5cf6',
            accentColorForeground: '#ffffff',
            borderRadius: 'medium',
            overlayBlur: 'small',
          })}
        >
          <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="bg-particles" />
            <FloatingEmojis />
            <div className="fixed inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
            
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <Logo />
                  <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span>Track what you love</span>
                    </div>
                  </div>
                  <WalletConnect />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Hero Section */}
              <div className="text-center mb-10 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-pulse-glow">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-gray-300">Powered by Zama FHE Technology</span>
                  <span className="text-lg">🔮</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                  <span className="text-gradient-purple">Track Your Passions</span>
                  <br />
                  <span className="text-white">With Complete Privacy</span>
                  <span className="ml-3 inline-block animate-bounce">🎯</span>
                </h1>
                
                <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
                  Your hobby data is encrypted end-to-end using Fully Homomorphic Encryption. 
                  Only you can decrypt and view your personal activity records.
                </p>

                {/* Hobby Showcase */}
                <HobbyShowcase />
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-fade-in stagger-1">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} />
                ))}
              </div>

              {/* Tab Navigation */}
              <div className="flex justify-center mb-8 animate-fade-in stagger-2">
                <div className="inline-flex p-1.5 rounded-2xl glass">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                          flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
                          ${isActive 
                            ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105` 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <span className="text-lg">{tab.emoji}</span>
                        <Icon className="w-5 h-5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content with Transition */}
              <div className={`tab-content ${isTransitioning ? 'tab-exit' : 'tab-enter'}`}>
                {displayTab === 'add' && (
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <span className="text-4xl">🎨</span>
                        <h2 className="text-2xl font-bold text-white">Record Your Activity</h2>
                        <span className="text-4xl">🎯</span>
                      </div>
                      <p className="text-gray-400">Your entry will be encrypted before storing on-chain</p>
                    </div>
                    <HobbyEntryForm />
                    
                    {/* Tips Section */}
                    <div className="mt-8 glass-card rounded-2xl p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span>💡</span> Quick Tips
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🏃</span>
                          <div>
                            <p className="text-white text-sm font-medium">Stay Active</p>
                            <p className="text-gray-500 text-xs">Track your fitness journey</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🎨</span>
                          <div>
                            <p className="text-white text-sm font-medium">Be Creative</p>
                            <p className="text-gray-500 text-xs">Express yourself through art</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📚</span>
                          <div>
                            <p className="text-white text-sm font-medium">Keep Learning</p>
                            <p className="text-gray-500 text-xs">Expand your knowledge</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🌿</span>
                          <div>
                            <p className="text-white text-sm font-medium">Connect with Nature</p>
                            <p className="text-gray-500 text-xs">Enjoy the outdoors</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {displayTab === 'history' && (
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <span className="text-4xl">📜</span>
                        <h2 className="text-2xl font-bold text-white">Your Encrypted History</h2>
                        <span className="text-4xl">🔐</span>
                      </div>
                      <p className="text-gray-400">Decrypt entries to view your private hobby records</p>
                    </div>
                    <HobbyHistory />
                  </div>
                )}

                {displayTab === 'analysis' && (
                  <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <span className="text-4xl">📊</span>
                        <h2 className="text-2xl font-bold text-white">Privacy-Preserving Analytics</h2>
                        <span className="text-4xl">🔮</span>
                      </div>
                      <p className="text-gray-400">Discover patterns in your hobby engagement</p>
                    </div>
                    <HobbyAnalysis />
                  </div>
                )}
              </div>

              {/* Decorative Elements */}
              <div className="mt-16 flex justify-center gap-4 opacity-30">
                <Gamepad2 className="w-8 h-8 text-violet-400 animate-float" />
                <Camera className="w-8 h-8 text-cyan-400 animate-float" style={{ animationDelay: '0.5s' }} />
                <Bike className="w-8 h-8 text-emerald-400 animate-float" style={{ animationDelay: '1s' }} />
                <Coffee className="w-8 h-8 text-amber-400 animate-float" style={{ animationDelay: '1.5s' }} />
              </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 mt-12 py-8 border-t border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-violet-400" />
                      <span className="text-gray-400 text-sm">
                        Built with Zama's FHE
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-2xl">🔐</span>
                      <span className="text-2xl">🎨</span>
                      <span className="text-2xl">🏃</span>
                      <span className="text-2xl">📚</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span>Made with</span>
                    <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
                    <span>for privacy enthusiasts</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
