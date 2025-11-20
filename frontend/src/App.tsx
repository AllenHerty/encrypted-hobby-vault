import { useState } from "react";
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
import { Plus, History, BarChart3, Menu, X } from "lucide-react";
import "./App.css";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'history' | 'analysis'>('add');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          locale="en-US"
          modalSize="compact"
          theme={darkTheme({
            accentColor: 'hsl(215, 20%, 65%)',
            accentColorForeground: 'hsl(210, 40%, 98%)',
            borderRadius: 'medium',
          })}
        >
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-500/20">
              <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-500/10 text-slate-300"
                  >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                  <Logo />
            </div>
                <WalletConnect />
        </div>
      </header>

            <div className="flex h-[calc(100vh-64px)]">
              {/* Sidebar Navigation */}
              <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-xl
                border-r border-slate-500/20
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                pt-6
              `}>
                <nav className="px-4 space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('add');
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${activeTab === 'add'
                        ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-lg shadow-slate-500/50'
                        : 'text-slate-200 hover:bg-slate-500/10 hover:text-slate-100'
                      }
                    `}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add Hobby</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${activeTab === 'history'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                        : 'text-slate-300 hover:bg-blue-500/10 hover:text-blue-300'
                      }
                    `}
                  >
                    <History className="w-5 h-5" />
                    <span className="font-medium">History</span>
                  </button>

                <button
                    onClick={() => {
                      setActiveTab('analysis');
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${activeTab === 'analysis'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                        : 'text-slate-300 hover:bg-green-500/10 hover:text-green-300'
                      }
                    `}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">Analysis</span>
                </button>
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-500/20">
                  <div className="text-xs text-slate-300 text-center">
                    <p className="font-semibold text-slate-100 mb-1">Encrypt Hobby</p>
                    <p className="text-slate-200">Privacy-first hobby tracking</p>
                  </div>
                </div>
              </aside>

              {/* Overlay for mobile */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === 'add' && (
                      <div className="animate-fade-in">
                        <div className="mb-6">
                          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 bg-clip-text text-transparent mb-2">
                            Add New Hobby Entry
                          </h1>
                          <p className="text-slate-200">
                            Record your hobby activities with end-to-end encryption
                          </p>
                  </div>
                        <div className="max-w-2xl">
                          <HobbyEntryForm />
                    </div>
                  </div>
                )}

                    {activeTab === 'history' && (
                      <div className="animate-fade-in">
                        <div className="mb-6">
                          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                            Hobby History
                          </h1>
                          <p className="text-slate-200">
                            View and decrypt your encrypted hobby entries
                          </p>
                    </div>
                        <HobbyHistory />
                  </div>
                )}

                    {activeTab === 'analysis' && (
                      <div className="animate-fade-in">
                        <div className="mb-6">
                          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
                            Hobby Analysis
                          </h1>
                          <p className="text-slate-200">
                            Discover patterns in your hobby engagement and enjoyment
                          </p>
                    </div>
                        <HobbyAnalysis />
                  </div>
                )}
                  </div>
        </div>
      </main>
    </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
