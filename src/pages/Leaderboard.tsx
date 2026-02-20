
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { User } from '../types';
import { Trophy, Medal, Crown, TrendingUp, Search, Award } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = db.getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      await db.refresh();
      setUsers(db.getLeaderboard());
    };
    loadData();
    
    const interval = setInterval(loadData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u => 
    u.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredUsers.slice(0, 3);
  const others = filteredUsers.slice(3);

  const formatAddress = (addr: string) => {
    if (addr === 'Guest') return 'Guest';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Ranks</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Top Contributors</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 items-end pt-8 pb-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-lg">
                <div className="text-xl font-black text-slate-400">#2</div>
              </div>
              <div className="absolute -top-3 -right-3 p-1.5 bg-slate-400 text-white rounded-lg shadow-md">
                <Medal size={14} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-900 truncate w-20">
                {formatAddress(topThree[1].address)}
              </p>
              <p className="text-[10px] font-bold text-blue-600">
                {topThree[1].points + topThree[1].totalBonusPoints} PTS
              </p>
            </div>
            <div className="w-full h-16 bg-slate-100 rounded-t-2xl border-x border-t border-slate-200"></div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-[2rem] bg-yellow-50 border-4 border-yellow-400 flex items-center justify-center overflow-hidden shadow-xl shadow-yellow-500/10">
                <div className="text-2xl font-black text-yellow-600">#1</div>
              </div>
              <div className="absolute -top-4 -right-4 p-2 bg-yellow-500 text-white rounded-xl shadow-lg animate-bounce">
                <Crown size={18} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-900 truncate w-24">
                {formatAddress(topThree[0].address)}
              </p>
              <p className="text-xs font-bold text-blue-600">
                {topThree[0].points + topThree[0].totalBonusPoints} PTS
              </p>
            </div>
            <div className="w-full h-24 bg-yellow-50 rounded-t-[2rem] border-x border-t border-yellow-100"></div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center overflow-hidden shadow-lg">
                <div className="text-xl font-black text-orange-400">#3</div>
              </div>
              <div className="absolute -top-3 -right-3 p-1.5 bg-orange-400 text-white rounded-lg shadow-md">
                <Medal size={14} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-900 truncate w-20">
                {formatAddress(topThree[2].address)}
              </p>
              <p className="text-[10px] font-bold text-blue-600">
                {topThree[2].points + topThree[2].totalBonusPoints} PTS
              </p>
            </div>
            <div className="w-full h-12 bg-orange-50 rounded-t-2xl border-x border-t border-orange-100"></div>
          </div>
        )}
      </div>

      {/* Search & List */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div className="glass rounded-[2rem] overflow-hidden border-slate-100">
          <div className="divide-y divide-slate-50">
            {others.map((u, idx) => {
              const isMe = u.address.toLowerCase() === currentUser.address.toLowerCase();
              return (
                <div 
                  key={u.address}
                  className={`flex items-center justify-between p-5 transition-colors ${isMe ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-xs font-black text-slate-400">#{idx + 4}</span>
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${isMe ? 'text-blue-600' : 'text-slate-900'}`}>
                        {formatAddress(u.address)} {isMe && '(You)'}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <TrendingUp size={10} className="text-green-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {u.eventsAttended.length} Events • {u.dailyStreak} Streak
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {u.points + u.totalBonusPoints}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-20">
          <Trophy size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No users found</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
