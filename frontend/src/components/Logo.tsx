import { Trophy } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-500 rounded-lg flex items-center justify-center shadow-lg">
        <Trophy className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent">
          Encrypt Hobby
        </h1>
        <p className="text-xs text-slate-300">Encrypted Private Hobby Tracker</p>
      </div>
    </div>
  );
};

export default Logo;

