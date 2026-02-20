
import React from 'react';
import { Info, Target, Award, Zap, Shield, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

const Guide: React.FC = () => {
  const steps = [
    {
      icon: <Target className="text-blue-600" size={24} />,
      title: "Join Events",
      description: "Browse the Explore tab to find active events. Join them to participate and earn rewards."
    },
    {
      icon: <Zap className="text-yellow-600" size={24} />,
      title: "Complete Tasks",
      description: "Each event has specific tasks like MCQs or learning modules. Complete them accurately."
    },
    {
      icon: <Award className="text-purple-600" size={24} />,
      title: "Earn Points",
      description: "Once your submission is approved, points are added to your profile automatically."
    },
    {
      icon: <Shield className="text-green-600" size={24} />,
      title: "Keep Streaks",
      description: "Participate daily to build your streak and earn massive bonus points every week and month."
    }
  ];

  const faqs = [
    {
      q: "How do I get my rewards?",
      a: "Points earned on Verse Event are tracked on-chain or via our ecosystem. Seasonal rewards are distributed based on your rank."
    },
    {
      q: "What are 'Auto-Approved' events?",
      a: "Events like MCQs are graded instantly. If you get the answers right, you get points immediately!"
    },
    {
      q: "Why did my submission get rejected?",
      a: "Submissions are rejected if answers are incorrect or if the proof provided doesn't meet the host's requirements."
    }
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Guide</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">How it works</p>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-4">Welcome to Verse Event</h2>
          <p className="text-slate-400 font-medium leading-relaxed mb-6">
            The ultimate platform for community engagement. Learn about Web3, participate in exclusive events, and climb the ranks to earn real rewards.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">1,000+ Active Participants</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="grid gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-5 group">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-slate-400" size={20} />
          <h2 className="text-xl font-black text-slate-900">Common Questions</h2>
        </div>
        <div className="grid gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass rounded-3xl p-6 border-slate-100">
              <h4 className="font-black text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-500" />
                {faq.q}
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center py-10 bg-blue-50 rounded-[3rem] border border-blue-100 px-8">
        <h3 className="text-xl font-black text-blue-900 mb-2">Ready to start?</h3>
        <p className="text-sm text-blue-700/60 font-bold mb-6 uppercase tracking-widest">Your journey begins here</p>
        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 mx-auto">
          Explore Events <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Guide;
