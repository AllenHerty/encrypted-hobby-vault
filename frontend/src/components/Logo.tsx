import { Shield, Sparkles } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold text-white">
          Encrypt<span className="text-gradient-purple">Hobby</span>
        </h1>
        <p className="text-xs text-gray-500">Privacy-First Tracking</p>
      </div>
    </div>
  );
};

export default Logo;
