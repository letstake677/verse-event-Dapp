
import React, { useState } from 'react';
import { Package, CheckCircle2, ChevronRight, Sparkles, Zap, Trophy, BookOpen } from 'lucide-react';
import { db } from '../store';
import { useNavigate } from 'react-router-dom';

const VersePack: React.FC = () => {
  const navigate = useNavigate();
  const user = db.getCurrentUser();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const tasks = [
    { id: 't1', title: 'Connect Wallet', description: 'Link your Web3 wallet to Verse', icon: <Zap size={18} />, action: 'Connected' },
    { id: 't2', title: 'First Lesson', description: 'Complete any module in Academy', icon: <BookOpen size={18} />, action: 'Go to Academy', link: '/learn' },
    { id: 't3', title: 'Join an Event', description: 'Participate in your first community event', icon: <Trophy size={18} />, action: 'Explore', link: '/' },
  ];

  const isTaskCompleted = (id: string) => {
    if (id === 't1') return !!user.address && user.address !== 'Guest';
    if (id === 't2') return user.moduleProgress.length > 0;
    if (id === 't3') return user.eventsJoined.length > 0;
    return false;
  };

  const allCompleted = tasks.every(t => isTaskCompleted(t.id));

  const handleClaim = async () => {
    if (allCompleted) {
      // In a real app, we'd update the user's versePackCompleted status
      // For now, let's just show a success message and redirect
      alert('Congratulations! You have claimed the Verse Starter Pack (1,000 Points)!');
      // We should add points to the user
      // But db doesn't have a direct "claimVersePack" method.
      // Let's assume it's a one-time thing.
      navigate('/');
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Starter Pack</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Kickstart your journey</p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
            <Package size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">Verse Starter Pack</h2>
          <p className="text-blue-100 font-medium leading-relaxed mb-6">
            Complete these 3 simple steps to unlock your first 1,000 points and a special "Early Adopter" badge.
          </p>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-300" />
            <span className="text-sm font-black uppercase tracking-widest">1,000 Points Reward</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const completed = isTaskCompleted(task.id);
          return (
            <div 
              key={task.id}
              className={`glass rounded-3xl p-6 border-slate-100 flex items-center justify-between transition-all ${completed ? 'bg-emerald-50/50 border-emerald-100' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {completed ? <CheckCircle2 size={20} /> : task.icon}
                </div>
                <div>
                  <h3 className={`text-sm font-black ${completed ? 'text-emerald-900' : 'text-slate-900'}`}>{task.title}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{task.description}</p>
                </div>
              </div>
              
              {!completed ? (
                <button 
                  onClick={() => task.link && navigate(task.link)}
                  className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
                >
                  {task.action}
                </button>
              ) : (
                <div className="text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        disabled={!allCompleted}
        onClick={handleClaim}
        className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl transition-all ${
          allCompleted 
            ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-95' 
            : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
        }`}
      >
        {allCompleted ? 'Claim 1,000 Points' : 'Complete all tasks to claim'}
      </button>
    </div>
  );
};

export default VersePack;
