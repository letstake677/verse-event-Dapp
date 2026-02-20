import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, RefreshCw, CheckCircle2, TrendingUp, Zap, FileText, BookOpen, Sparkles, ChevronRight, Flame, ArrowUpRight, Search, Package } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import { db } from '../store';
import { Event, EventType } from '../types';
import { pointsToUsd, formatCurrency, formatPoints } from '../utils';
import { SearchContext } from '../components/Layout';

const EventsList: React.FC = () => {
  const { isConnected } = useAppKitAccount();
  const [timeFilter, setTimeFilter] = useState<'today' | 'tomorrow' | 'all'>('today');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { searchQuery } = useContext(SearchContext);
  const currentUser = db.getCurrentUser();

  const fetchEvents = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      let filtered = db.getEvents();
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const todayStr = now.toISOString().split('T')[0];
      
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Time Filter
      if (timeFilter === 'today') {
        filtered = filtered.filter(e => e.date === todayStr);
      } else if (timeFilter === 'tomorrow') {
        filtered = filtered.filter(e => e.date === tomorrowStr);
      }

      // Type Filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter(e => e.eventType === typeFilter);
      }

      // Search Filter
      if (searchQuery) {
        filtered = filtered.filter(e => 
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          e.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setEvents(filtered);
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => { fetchEvents(); }, [timeFilter, typeFilter, searchQuery]);

  const todayEvents = db.getEvents().filter(e => e.date === new Date().toISOString().split('T')[0]);
  const todayPotentialUsd = pointsToUsd(todayEvents.reduce((acc, curr) => acc + curr.points, 0));

  const getTypeIcon = (type: EventType) => {
    switch(type) {
      case EventType.MCQ: return <Zap size={14} className="text-orange-500" />;
      case EventType.FORM: return <FileText size={14} className="text-blue-500" />;
      case EventType.LEARN: return <BookOpen size={14} className="text-indigo-500" />;
    }
  };

  const getTypeText = (type: EventType) => {
    switch(type) {
      case EventType.MCQ: return "Auto-check";
      case EventType.FORM: return "Form Review";
      case EventType.LEARN: return "Learn & Earn";
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {!isConnected && (
        <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-100 flex flex-col items-center text-center gap-4 animate-scale">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Connect Your Wallet</h3>
            <p className="text-xs text-blue-100 font-medium">Connect to track your progress and claim rewards.</p>
          </div>
          <appkit-button />
        </div>
      )}

      {/* Dynamic Header Dashboard */}
      <div className="animate-scale stagger-1">
        <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl shadow-slate-200">
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Ranking</p>
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400" />
                  <span className="text-xl font-extrabold">Top 10%</span>
                </div>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-700">
                    <img src={`https://picsum.photos/seed/${i + 10}/32`} alt="avatar" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold">+12</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={14} className="text-orange-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Streak</span>
                </div>
                <p className="text-xl font-black">{currentUser.dailyStreak} Days</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-blue-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Bonus</span>
                </div>
                <p className="text-xl font-black">+{formatPoints(currentUser.totalBonusPoints)}</p>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-600/10 to-transparent"></div>
        </div>
      </div>

      {/* Verse Pack Promotion */}
      {!currentUser.versePackCompleted && (
        <Link to="/verse-pack" className="block stagger-1.5">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-[32px] p-5 text-white shadow-lg shadow-blue-100 group">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white animate-pulse">
                  <Package size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">Verse Starter Pack</h4>
                  <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest">Unlock 1,000 Bonus Points</p>
                </div>
              </div>
              <div className="bg-white text-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <ArrowUpRight size={18} />
              </div>
            </div>
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          </div>
        </Link>
      )}

      {/* Newbie Guide Integration */}
      <Link to="/guide" className="block stagger-2">
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-5 shadow-sm group hover:border-blue-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 animate-float">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Newbie Guidance</h4>
                <p className="text-[11px] text-slate-400 font-medium">Learn how to maximize your impact</p>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </Link>

      {/* Filter Tabs */}
      <div className="sticky top-20 z-10 py-2 glass -mx-4 px-4 border-y border-slate-100 stagger-4">
        <div className="flex flex-col gap-3">
          <div className="flex bg-slate-100/50 p-1 rounded-2xl">
            {(['today', 'tomorrow', 'all'] as const).map(f => (
              <button 
                key={f} 
                onClick={() => setTimeFilter(f)} 
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${timeFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button 
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all ${typeFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
            >
              All Types
            </button>
            {(Object.values(EventType)).map(t => (
              <button 
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all ${typeFilter === t ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
              >
                {getTypeIcon(t)}
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {isRefreshing ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Searching Events...</p>
          </div>
        ) : events.length > 0 ? (
          events.map((event, idx) => {
            const hasJoined = currentUser.eventsJoined.includes(event.id);
            return (
              <Link 
                key={event.id} 
                to={`/event/${event.id}`} 
                className={`block bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group`}
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                    {getTypeIcon(event.eventType)}
                    <span className="text-[10px] font-black uppercase text-slate-500">{getTypeText(event.eventType)}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-600 font-extrabold text-base">
                      <Trophy size={16} />
                      <span>{formatPoints(event.points)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">pts</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-tight">
                  {event.name}
                </h3>
                
                <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold mb-5">
                  <div className="flex items-center gap-1.5"><MapPin size={12} className="text-blue-500" /><span>{event.venue}</span></div>
                  <div className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500" /><span>{event.time}</span></div>
                </div>

                <div className={`w-full font-black py-4 rounded-2xl text-center text-xs uppercase tracking-widest transition-all ${
                  hasJoined 
                    ? 'bg-slate-100 text-slate-400' 
                    : 'bg-slate-900 text-white shadow-lg shadow-slate-200 active:scale-95'
                }`}>
                  {hasJoined ? 'Continue Progress' : 'Start Event'}
                </div>

                {/* Status Indicator */}
                {hasJoined && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white p-2 rounded-bl-2xl">
                    <CheckCircle2 size={12} />
                  </div>
                )}
              </Link>
            );
          })
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="text-slate-200" size={32} />
            </div>
            <h3 className="text-slate-900 font-black uppercase tracking-tight">No Events Found</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;