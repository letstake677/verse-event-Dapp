import React from 'react';
import { Wallet, LogOut, CheckCircle, Flame, Calendar, Sparkles, Trophy, LogIn } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { db } from '../store';
import { pointsToUsd, formatCurrency, formatPoints } from '../utils';

const Profile: React.FC = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const user = db.getCurrentUser();
  const settings = db.getBonusSettings();
  const totalPoints = user.points + user.totalBonusPoints;
  
  const weeklyProgress = Math.min((user.weeklyCheckIns / settings.weeklyThreshold) * 100, 100);

  if (!isConnected || !address) {
    return (
      <div className="space-y-6 py-20 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mb-4">
          <Wallet size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Connect Wallet</h2>
          <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Connect your wallet via Reown AppKit to track your rewards and participate in events.</p>
        </div>
        <div className="mt-4">
          <appkit-button />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Mainnet</span>
        </div>
        
        <div className="relative mb-4">
          <img src={`https://picsum.photos/seed/${address}/100`} className="w-24 h-24 rounded-full border-4 border-white shadow-lg" alt="Profile" />
          <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white">
            <CheckCircle size={16} className="text-white" />
          </div>
        </div>
        
        <h3 className="font-black text-slate-900 mb-1">{address?.slice(0, 6)}...{address?.slice(-4)}</h3>
        <p className="text-[10px] text-slate-400 font-black mb-6 uppercase tracking-widest">Verified Verse Member</p>
        
        <div className="w-full bg-slate-50 rounded-[32px] border border-slate-100 p-6 space-y-1 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Earning</p>
          <h2 className="text-4xl font-black text-blue-600 leading-tight">{formatPoints(totalPoints)} <span className="text-lg font-bold opacity-30 italic">pts</span></h2>
          <div className="mt-4 inline-block bg-emerald-500 text-white px-5 py-2 rounded-2xl shadow-lg shadow-emerald-100">
            <p className="text-sm font-black italic">≈ {formatCurrency(pointsToUsd(totalPoints))}</p>
          </div>
        </div>
      </div>

      {/* Rewards & Bonuses */}
      <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Sparkles size={20} className="text-orange-500" />
            Check-in Rewards
          </h3>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">
            +{formatPoints(user.totalBonusPoints)} Bonus
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-orange-50 rounded-[32px] border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-100 animate-float">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Streak</p>
                <p className="text-2xl font-black text-orange-600">{user.dailyStreak} Days</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Check-in</p>
              <p className="text-base font-black text-slate-700">+{settings.dailyBonus}</p>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-blue-50 rounded-[32px] border border-blue-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                <span className="text-xs font-black uppercase text-slate-700">Weekly Goal</span>
              </div>
              <span className="text-xs font-black text-blue-600">{user.weeklyCheckIns}/{settings.weeklyThreshold}</span>
            </div>
            <div className="h-2.5 w-full bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${weeklyProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest"><Trophy size={14} /><span>Events</span></div>
          <p className="text-3xl font-black text-slate-800">{user.eventsAttended.length}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Approved</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-2 text-left">
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest"><Wallet size={14} /><span>Wallet</span></div>
          <p className="text-lg font-black text-slate-800 truncate">{address.slice(0, 10)}...</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Active Profile</p>
        </div>
      </div>

      <button 
        onClick={() => open()} 
        className="w-full mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 px-4 py-6 rounded-[32px] transition-colors border border-slate-50"
      >
        <Wallet size={18} />
        Manage Wallet
      </button>
    </div>
  );
};

export default Profile;
