import React from 'react';
import { BookOpen } from 'lucide-react';

const SplashScreen: React.FC<{ isExiting?: boolean }> = ({ isExiting }) => {
  return (
    <div className={`fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 blur-[100px] animate-pulse delay-700"></div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Pulsing Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-ping opacity-20"></div>
          
          {/* Main Coin Body */}
          <div className="absolute inset-0 rounded-full border-[4px] border-yellow-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_0_30px_rgba(234,179,8,0.5)] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-2 rounded-full border border-yellow-500/20"></div>
            
            <span className="absolute top-4 text-[10px] font-black text-white tracking-[0.3em]">VERSE</span>
            
            <div className="relative z-10 flex items-center justify-center scale-150">
              <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full"></div>
              <BookOpen size={32} className="text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" strokeWidth={2.5} />
            </div>
            
            <span className="absolute bottom-4 text-[8px] font-black text-white/90 tracking-[0.1em] whitespace-nowrap">LEARN & EARN</span>
          </div>
        </div>

        {/* Text Animation */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black text-white tracking-tighter" style={{ animationDelay: '0.3s' }}>
            Verse Event
          </h1>
          <div className="h-1 w-12 bg-yellow-500 rounded-full" style={{ animationDelay: '0.5s' }}></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2" style={{ animationDelay: '0.7s' }}>
            Community Rewards
          </p>
        </div>
      </div>

      {/* Loading Bar */}
      <div className="absolute bottom-20 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-500 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
