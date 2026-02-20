import React, { useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Award, User, Settings, BookOpen, Info, Search, X } from 'lucide-react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const SearchContext = createContext<SearchContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
});

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { path: '/', label: 'Explore', icon: <Calendar size={20} /> },
    { path: '/learn', label: 'Academy', icon: <BookOpen size={20} /> },
    { path: '/leaderboard', label: 'Ranks', icon: <Award size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/admin', label: 'Host', icon: <Settings size={20} /> },
  ];

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="flex flex-col min-h-screen pb-20 max-w-md mx-auto bg-white shadow-2xl relative overflow-x-hidden border-x border-slate-50">
        <header className="sticky top-0 z-50 glass border-b border-slate-100/50 px-6 py-4 flex flex-col gap-3 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 flex items-center justify-center group">
                  {/* Outer Gold Glow */}
                  <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-md group-hover:bg-yellow-500/30 transition-all"></div>
                  
                  {/* Main Coin Body */}
                  <div className="absolute inset-0 rounded-full border-[3px] border-yellow-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.5),0_0_15px_rgba(234,179,8,0.4)] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
                    
                    {/* Inner Decorative Ring */}
                    <div className="absolute inset-1 rounded-full border border-yellow-500/30"></div>
                    
                    {/* Top Text: VERSE */}
                    <span className="absolute top-1.5 text-[7px] font-black text-white tracking-[0.15em] leading-none">VERSE</span>
                    
                    {/* Center Icon: Book with Glow */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="absolute inset-0 bg-blue-500/40 blur-lg rounded-full"></div>
                      <BookOpen size={22} className="text-white relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                    </div>
                    
                    {/* Bottom Text: LEARN & EARN */}
                    <span className="absolute bottom-1.5 text-[5px] font-black text-white/90 tracking-[0.05em] leading-none whitespace-nowrap">LEARN & EARN</span>
                    
                    {/* Small Dollar Icon (Mimicking the plant) */}
                    <div className="absolute bottom-3 right-2 text-yellow-500 opacity-80">
                      <div className="text-[6px] font-bold">$</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-slate-900 leading-none">Verse Event</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase leading-none mt-1">Community Rewards</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) setSearchQuery('');
                }}
                className={`p-2 transition-colors rounded-xl ${isSearchOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
              >
                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
              <div className="scale-75 origin-right">
                <appkit-button />
              </div>
              <Link 
                to="/guide" 
                className="p-2 bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 transition-all active:scale-95"
              >
                <Info size={18} />
              </Link>
            </div>
          </div>
          
          {isSearchOpen && (
            <div className="animate-fade-up">
              <input 
                autoFocus
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          )}
        </header>

        <main className="flex-1 px-4 py-6">
          {children}
          <footer className="mt-12 mb-8 px-8 text-center">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent mb-6"></div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              🚀 Rewards via Verse Ecosystem
            </p>
          </footer>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-slate-100/50 px-2 py-4 flex justify-around items-center z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1.5 transition-all flex-1 relative ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-50 shadow-sm' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </SearchContext.Provider>
  );
};

export default Layout;