import React, { useState, useEffect } from 'react';
import { 
  Plus, RefreshCw, FileText, Zap, BookOpen, Trash2, Send, Trophy, 
  Settings, CheckCircle2, XCircle, Table, PlusCircle, LayoutList,
  ChevronDown, Copy, ExternalLink, GripVertical
} from 'lucide-react';
import { db } from '../store';
import { Event, EventType, QuestionType, FormField, MCQQuestion, SubmissionStatus } from '../types';
import { pointsToUsd, formatCurrency, formatPoints } from '../utils';

const Admin: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'sheet' | 'create' | 'reviews'>('sheet');
  const [eventType, setEventType] = useState<EventType>(EventType.MCQ);
  const [isPublished, setIsPublished] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);

  useEffect(() => {
    const events = db.getEvents();
    console.log('Admin: Refreshing events list', events.length);
    setActiveEvents([...events]); // Use spread to ensure a new reference
  }, [refresh]);

  // Create Event Form State
  const [eventName, setEventName] = useState('');
  const [eventPoints, setEventPoints] = useState(500);
  const [eventDesc, setEventDesc] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [top15Points, setTop15Points] = useState(1000);
  const [next25Points, setNext25Points] = useState(500);
  const [restPoints, setRestPoints] = useState(100);
  const [useDistribution, setUseDistribution] = useState(false);

  // Question Builder States
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  if (!isUnlocked) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-8 text-center">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-slate-200">
            <Settings size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Admin Access</h2>
            <p className="text-sm font-medium text-slate-400">Enter the security code to access the panel.</p>
          </div>
          <div className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-black tracking-[1em] focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password === 'Talh') {
                  setIsUnlocked(true);
                }
              }}
            />
            <button 
              onClick={() => {
                if (password === 'Talh') {
                  setIsUnlocked(true);
                } else {
                  alert('Incorrect code');
                }
              }}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-100 active:scale-95 transition-all uppercase tracking-widest text-xs"
            >
              Unlock Panel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Question Builder States

  const addMcqQuestion = () => {
    const newQ: MCQQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      options: ['', '', '', ''],
      correctOption: 0
    };
    setMcqQuestions([...mcqQuestions, newQ]);
  };

  const addFormField = () => {
    const newF: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      type: QuestionType.TEXT,
      required: true
    };
    setFormFields([...formFields, newF]);
  };

  const updateMcq = (id: string, updates: Partial<MCQQuestion>) => {
    setMcqQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateForm = (id: string, updates: Partial<FormField>) => {
    setFormFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeMcq = (id: string) => setMcqQuestions(prev => prev.filter(q => q.id !== id));
  const removeForm = (id: string) => setFormFields(prev => prev.filter(f => f.id !== id));

  const resetForm = () => {
    setEventName('');
    setEventPoints(500);
    setEventDesc('');
    setStartTime('');
    setEndTime('');
    setSelectedModuleId('');
    setUseDistribution(false);
    setMcqQuestions([]);
    setFormFields([]);
    setIsPublished(null);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (eventType === EventType.MCQ && mcqQuestions.length === 0) {
      alert("Please add at least one question.");
      return;
    }
    if (eventType === EventType.FORM && formFields.length === 0) {
      alert("Please add at least one form field.");
      return;
    }

    const newId = Math.random().toString(36).substr(2, 9);
    const newEvent: Event = {
      id: newId,
      name: eventName,
      points: eventPoints,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      venue: 'Online Community',
      description: eventDesc || 'Join our community event and earn rewards.',
      creator: 'admin',
      eventType,
      mcqQuestions: eventType === EventType.MCQ ? mcqQuestions : undefined,
      formFields: eventType === EventType.FORM ? formFields : undefined,
      moduleId: eventType === EventType.LEARN ? selectedModuleId : undefined,
      startTime: startTime ? new Date(startTime).toISOString() : undefined,
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      pointDistribution: useDistribution ? {
        top15: top15Points,
        next25: next25Points,
        rest: restPoints
      } : undefined
    };

    await db.addEvent(newEvent);
    setIsPublished(newId);
  };

  const deleteEvent = async (id: string) => {
    console.log('Attempting to delete event:', id);
    if (confirm('Delete this event? This cannot be undone.')) {
      try {
        await db.deleteEvent(id);
        console.log('Event deleted successfully');
        setRefresh(prev => prev + 1);
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const handleSeasonalReset = async () => {
    if (confirm('Are you sure you want to reset the season? This will clear all user points and streaks for the new season.')) {
      await db.seasonalReset();
    }
  };

  const handleFullReset = async () => {
    if (confirm('DANGER: This will delete ALL data including events, users, and submissions. Continue?')) {
      await db.resetData();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Tab Navigation */}
      <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 flex gap-1 shadow-sm">
        <button 
          onClick={() => { setActiveTab('sheet'); setIsPublished(null); }}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'sheet' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Table size={14} /> Spreadsheet
        </button>
        <button 
          onClick={() => { setActiveTab('create'); setIsPublished(null); }}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'create' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <PlusCircle size={14} /> New Event
        </button>
        <button 
          onClick={() => { setActiveTab('reviews'); setIsPublished(null); }}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'reviews' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <CheckCircle2 size={14} /> Reviews
        </button>
      </div>

      {activeTab === 'sheet' && (
        <div className="space-y-6">
          {/* System Controls */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <Settings size={14} /> System Controls
            </h3>
            <div className="flex gap-3">
              <button 
                onClick={handleSeasonalReset}
                className="flex-1 py-4 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-100 transition-all"
              >
                <RefreshCw size={14} /> Reset Season
              </button>
              <button 
                onClick={handleFullReset}
                className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
              >
                <Trash2 size={14} /> Reset All Data
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Events</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeEvents.length} Items</p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Name</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Points</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeEvents.map((event) => (
                  <tr key={event.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      {event.eventType === EventType.MCQ ? <Zap size={16} className="text-orange-500" /> : event.eventType === EventType.FORM ? <FileText size={16} className="text-blue-500" /> : <BookOpen size={16} className="text-indigo-500" />}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{event.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{event.date}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-black text-slate-900">{formatPoints(event.points)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'create' && !isPublished && (
        <form onSubmit={handleCreateEvent} className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            
            <div className="space-y-4">
              <input 
                required
                type="text" 
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                placeholder="Untitled Event"
                className="w-full text-3xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none border-b-2 border-transparent focus:border-blue-600/10 py-2 transition-all"
              />
              <textarea 
                value={eventDesc}
                onChange={e => setEventDesc(e.target.value)}
                placeholder="Form description..."
                className="w-full text-sm font-medium text-slate-500 focus:outline-none placeholder:text-slate-300 min-h-[60px] resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-50">
               <div className="flex-1 space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Check-in Reward</label>
                 <div className="relative">
                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                    <input 
                      type="number" 
                      value={eventPoints}
                      onChange={e => setEventPoints(parseInt(e.target.value))}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800"
                    />
                 </div>
               </div>
               <div className="flex-1 space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Check-in Type</label>
                 <div className="relative">
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select 
                        value={eventType}
                        onChange={e => {
                          setEventType(e.target.value as EventType);
                          setMcqQuestions([]);
                          setFormFields([]);
                        }}
                        className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 appearance-none"
                    >
                      <option value={EventType.MCQ}>Multiple Choice Quiz</option>
                      <option value={EventType.FORM}>Questionnaire Form</option>
                      <option value={EventType.LEARN}>Learn & Earn</option>
                    </select>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Time (UTC)</label>
                 <input 
                   type="datetime-local" 
                   value={startTime}
                   onChange={e => setStartTime(e.target.value)}
                   className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-xs"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Time (UTC)</label>
                 <input 
                   type="datetime-local" 
                   value={endTime}
                   onChange={e => setEndTime(e.target.value)}
                   className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-xs"
                 />
               </div>
            </div>

            {eventType === EventType.LEARN && (
              <div className="pt-4 border-t border-slate-50 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Academy Module</label>
                <div className="relative">
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <select 
                    required
                    value={selectedModuleId}
                    onChange={e => setSelectedModuleId(e.target.value)}
                    className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 appearance-none"
                  >
                    <option value="">Select a module...</option>
                    {db.getModules().map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Point Distribution System</label>
                <button 
                  type="button"
                  onClick={() => setUseDistribution(!useDistribution)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${useDistribution ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  {useDistribution ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              
              {useDistribution && (
                <div className="grid grid-cols-3 gap-3 animate-scale">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight px-1">Top 15</label>
                    <input 
                      type="number" 
                      value={top15Points}
                      onChange={e => setTop15Points(parseInt(e.target.value))}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight px-1">Next 25</label>
                    <input 
                      type="number" 
                      value={next25Points}
                      onChange={e => setNext25Points(parseInt(e.target.value))}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight px-1">Rest</label>
                    <input 
                      type="number" 
                      value={restPoints}
                      onChange={e => setRestPoints(parseInt(e.target.value))}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question Builder */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
              <LayoutList size={14} />
              Build Check-in Flow
            </h3>

            {eventType === EventType.MCQ && (
              <div className="space-y-4">
                {mcqQuestions.map((q, qIdx) => (
                  <div key={q.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 relative group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-300">{qIdx + 1}</span>
                      <input 
                        required
                        type="text"
                        placeholder="Type question here..."
                        value={q.text}
                        onChange={e => updateMcq(q.id, { text: e.target.value })}
                        className="flex-1 text-sm font-bold text-slate-800 focus:outline-none border-b border-transparent focus:border-slate-100 py-1"
                      />
                      <button onClick={() => removeMcq(q.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Correct Option Index (1-4):</label>
                      <input 
                        type="number"
                        min="1"
                        max="4"
                        value={q.correctOption + 1}
                        onChange={e => {
                          const val = parseInt(e.target.value) - 1;
                          if (val >= 0 && val <= 3) updateMcq(q.id, { correctOption: val });
                        }}
                        className="w-12 p-1 bg-slate-50 border border-slate-100 rounded text-xs font-black text-center"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => updateMcq(q.id, { correctOption: oIdx })}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${q.correctOption === oIdx ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-200'}`}
                          >
                            {q.correctOption === oIdx && <CheckCircle2 size={12} />}
                          </button>
                          <input 
                            required
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={e => {
                              const newOpts = [...q.options];
                              newOpts[oIdx] = e.target.value;
                              updateMcq(q.id, { options: newOpts });
                            }}
                            className={`flex-1 p-2.5 text-xs rounded-xl border transition-all ${q.correctOption === oIdx ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addMcqQuestion}
                  className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-500 transition-all"
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
            )}

            {eventType === EventType.FORM && (
              <div className="space-y-4">
                {formFields.map((f, fIdx) => (
                  <div key={f.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 group">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <input 
                          required
                          type="text"
                          placeholder="Field Label (e.g. Your Feedback)"
                          value={f.label}
                          onChange={e => updateForm(f.id, { label: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <select 
                        value={f.type}
                        onChange={e => updateForm(f.id, { type: e.target.value as QuestionType })}
                        className="w-32 p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase appearance-none text-center"
                      >
                        <option value={QuestionType.TEXT}>Text</option>
                        <option value={QuestionType.PARAGRAPH}>Para</option>
                        <option value={QuestionType.NUMBER}>Num</option>
                      </select>
                      <button onClick={() => removeForm(f.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addFormField}
                  className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-500 transition-all"
                >
                  <Plus size={16} /> Add Field
                </button>
              </div>
            )}
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 text-white font-black rounded-[32px] shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} /> PUBLISH EVENT
            </button>
          </div>
        </form>
      )}

      {activeTab === 'create' && isPublished && (
        <div className="animate-scale flex flex-col items-center justify-center py-20 text-center space-y-8">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-100 animate-bounce">
                <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Event Published!</h2>
                <p className="text-sm font-medium text-slate-400">Your event is now live and accepting check-ins.</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <div className="p-5 bg-white border border-slate-100 rounded-[32px] shadow-sm flex items-center justify-between group">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event ID</p>
                        <p className="text-sm font-black text-slate-800">{isPublished}</p>
                    </div>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(isPublished); alert('Copied ID!'); }}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"
                    >
                        <Copy size={18} />
                    </button>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={resetForm}
                        className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-slate-100"
                    >
                        Build Another
                    </button>
                    <button 
                        onClick={() => window.location.hash = `/event/${isPublished}`}
                        className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                    >
                        View Live <ExternalLink size={14} />
                    </button>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Pending Reviews</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manual Approvals</p>
          </div>

          {db.getSubmissions().filter(s => s.status === SubmissionStatus.PENDING).length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No pending reviews</p>
            </div>
          ) : (
            db.getSubmissions().filter(s => s.status === SubmissionStatus.PENDING).map(sub => (
              <div key={sub.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 group">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">Review Required</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">User: {sub.userId.slice(0, 10)}...</p>
                    <p className="text-[9px] text-blue-600 font-black mt-1 uppercase tracking-widest">Event: {db.getEvents().find(e => e.id === sub.eventId)?.name}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">PENDING</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    {sub.answers.map(ans => (
                        <div key={ans.questionId} className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Response:</p>
                            <p className="text-xs font-bold text-slate-700">{ans.value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={async () => { await db.approveSubmission(sub.id); window.location.reload(); }} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 active:scale-95 transition-all">Approve</button>
                  <button onClick={async () => { await db.rejectSubmission(sub.id); window.location.reload(); }} className="flex-1 py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;