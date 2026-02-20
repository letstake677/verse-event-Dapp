
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Trophy, ChevronLeft, Send, CheckCircle2, Clock, XCircle, 
  Video, FileText, ExternalLink, BookOpen, GraduationCap, Zap, AlertCircle
} from 'lucide-react';
import { db } from '../store';
import { Event, SubmissionStatus, MCQQuestion, FormField, Answer, Submission, EventType } from '../types';
import { pointsToUsd, formatCurrency, formatPoints } from '../utils';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = db.getCurrentUser();

  // Dynamic answers state
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (id) {
      const e = db.getEvents().find(ev => ev.id === id);
      if (e) {
        setEvent(e);
        setHasJoined(user.eventsJoined.includes(id));
        const sub = db.getSubmissions().find(s => s.eventId === id && s.userId === user.address);
        if (sub) setSubmission(sub);
      }
    }
  }, [id, user]);

  const handleJoin = async () => { if (id) { await db.joinEvent(id); setHasJoined(true); } };

  const handleAnswer = (qId: string, val: string) => {
    setAnswers(prev => {
      const rest = prev.filter(a => a.questionId !== qId);
      return [...rest, { questionId: qId, value: val }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setIsSubmitting(true);
    const sub: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: event.id,
      userId: user.address,
      answers,
      status: SubmissionStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    
    await db.submitEvent(sub);
    setSubmission(sub);
    setIsSubmitting(false);
  };

  if (!event) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  const isModuleRequirementMet = event.eventType !== EventType.LEARN || 
    user.moduleProgress.find(p => p.moduleId === event.moduleId)?.completed;

  const now = new Date();
  const isTooEarly = event.startTime && now < new Date(event.startTime);
  const isTooLate = event.endTime && now > new Date(event.endTime);
  const isEventActive = !isTooEarly && !isTooLate;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-400 font-bold text-xs"><ChevronLeft size={16} /> BACK</button>
      
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              {event.eventType === EventType.MCQ && <Zap size={14} />}
              {event.eventType === EventType.FORM && <FileText size={14} />}
              {event.eventType === EventType.LEARN && <BookOpen size={14} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{event.eventType} EVENT</span>
            </div>
            <h1 className="text-2xl font-black mb-1">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100/80 font-medium">
              <div className="flex items-center gap-1"><MapPin size={12} /> {event.venue}</div>
              {event.startTime && (
                <div className="flex items-center gap-1"><Clock size={12} /> Starts: {new Date(event.startTime).toLocaleString()}</div>
              )}
              {event.endTime && (
                <div className="flex items-center gap-1"><XCircle size={12} /> Ends: {new Date(event.endTime).toLocaleString()}</div>
              )}
              {!event.startTime && <div>{event.time}</div>}
            </div>
          </div>

        <div className="p-6 space-y-8">
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg text-white"><Trophy size={20} /></div>
              <div>
                <p className="text-[10px] text-orange-600 font-bold uppercase">Reward</p>
                <p className="text-lg font-black text-orange-700">{formatPoints(event.points)} points <span className="text-sm font-bold opacity-60">(~{formatCurrency(pointsToUsd(event.points))})</span></p>
              </div>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>

          {!hasJoined ? (
            <button onClick={handleJoin} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg">JOIN EVENT</button>
          ) : !isModuleRequirementMet ? (
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center space-y-4">
              <div className="inline-block p-3 bg-white rounded-full text-indigo-600 shadow-sm"><AlertCircle size={32} /></div>
              <div>
                <h4 className="font-bold text-indigo-900">Module Requirement</h4>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">You must complete the <strong>{db.getModules().find(m => m.id === event.moduleId)?.title}</strong> module in the Learn section to participate.</p>
              </div>
              <button onClick={() => navigate('/learn')} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Go to Learn Section</button>
            </div>
          ) : submission ? (
            <div className={`p-8 rounded-2xl border-2 text-center space-y-4 ${
              submission.status === SubmissionStatus.PENDING ? 'bg-amber-50 border-amber-200 text-amber-700' :
              submission.status.includes('APPROVED') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              {submission.status.includes('APPROVED') ? <CheckCircle2 size={48} className="mx-auto" /> : <Clock size={48} className="mx-auto" />}
              <div>
                <h4 className="text-xl font-black uppercase">{submission.status.replace('_', ' ')}</h4>
                <p className="text-sm opacity-90 mt-2">
                  {submission.status === SubmissionStatus.PENDING ? "Host is reviewing your submission." : 
                   submission.status.includes('APPROVED') ? `Points awarded: +${formatPoints(event.points)}` : "Rejected. Check event rules."}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Submission Form</h4>
              </div>

              {event.eventType === EventType.MCQ && event.mcqQuestions?.map((q, idx) => (
                <div key={q.id} className="space-y-3">
                  <p className="font-bold text-slate-800">{idx + 1}. {q.text}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${answers.find(a => a.questionId === q.id)?.value === oIdx.toString() ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100'}`}>
                        <input type="radio" name={q.id} value={oIdx} onChange={() => handleAnswer(q.id, oIdx.toString())} className="hidden" />
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${answers.find(a => a.questionId === q.id)?.value === oIdx.toString() ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{String.fromCharCode(65 + oIdx)}</span>
                        <span className="text-sm text-slate-600">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {event.eventType === EventType.FORM && event.formFields?.map(f => (
                <div key={f.id} className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{f.label}{f.required && ' *'}</label>
                  {f.type === 'PARAGRAPH' ? (
                    <textarea rows={4} required={f.required} onChange={e => handleAnswer(f.id, e.target.value)} className="w-full p-3 bg-white border rounded-xl text-sm" />
                  ) : (
                    <input type={f.type === 'NUMBER' ? 'number' : 'text'} required={f.required} onChange={e => handleAnswer(f.id, e.target.value)} className="w-full p-3 bg-white border rounded-xl text-sm" />
                  )}
                </div>
              ))}

              {event.eventType === EventType.LEARN && (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-3">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-700">Module requirements verified!</p>
                  <p className="text-xs text-emerald-600">Click below to claim your event points.</p>
                </div>
              )}

              {!isEventActive && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-700">
                  <AlertCircle size={20} />
                  <p className="text-xs font-bold uppercase">
                    {isTooEarly ? "Event has not started yet" : "Event has ended"}
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || !isEventActive} 
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:bg-slate-300"
              >
                {isSubmitting ? 'PROCESSING...' : !isEventActive ? 'EVENT NOT ACTIVE' : 'SUBMIT CHECK-IN'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
