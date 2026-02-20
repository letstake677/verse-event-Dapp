
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { LearnModule } from '../types';
import { BookOpen, CheckCircle, ChevronRight, Play, Award, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Learn: React.FC = () => {
  const [modules, setModules] = useState<LearnModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<LearnModule | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const user = db.getCurrentUser();

  useEffect(() => {
    setModules(db.getModules());
  }, []);

  const handleStartModule = (mod: LearnModule) => {
    setSelectedModule(mod);
    setCurrentLessonIndex(0);
    setShowQuiz(false);
    setQuizAnswers([]);
    setQuizResult(null);
  };

  const handleNextLesson = () => {
    if (selectedModule && currentLessonIndex < selectedModule.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedModule) return;
    let correctCount = 0;
    selectedModule.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctOption) correctCount++;
    });
    const score = (correctCount / selectedModule.quiz.length) * 100;
    const passed = score >= 70;
    
    setQuizResult({ score, passed });
    if (passed) {
      await db.completeModule(selectedModule.id, score);
    }
  };

  if (selectedModule) {
    const lesson = selectedModule.lessons[currentLessonIndex];
    return (
      <div className="animate-fade-up">
        <button 
          onClick={() => setSelectedModule(null)}
          className="mb-6 text-sm font-bold text-slate-400 flex items-center gap-2 hover:text-slate-600 transition-colors"
        >
          <ChevronRight className="rotate-180" size={16} /> Back to Academy
        </button>

        {!showQuiz ? (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 border-blue-100/50 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <BookOpen size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Lesson {currentLessonIndex + 1} of {selectedModule.lessons.length}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">{lesson.title}</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed font-medium">
                  {lesson.content}
                </p>
              </div>
            </div>

            <button 
              onClick={handleNextLesson}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              {currentLessonIndex < selectedModule.lessons.length - 1 ? 'Next Lesson' : 'Start Quiz'}
              <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 border-blue-100/50 shadow-xl shadow-blue-900/5">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Module Quiz</h2>
              
              {!quizResult ? (
                <div className="space-y-8">
                  {selectedModule.quiz.map((q, qIdx) => (
                    <div key={q.id} className="space-y-4">
                      <p className="font-bold text-slate-800">{qIdx + 1}. {q.text}</p>
                      <div className="grid gap-3">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              const newAns = [...quizAnswers];
                              newAns[qIdx] = oIdx;
                              setQuizAnswers(newAns);
                            }}
                            className={`p-4 rounded-xl text-left text-sm font-bold transition-all border-2 ${
                              quizAnswers[qIdx] === oIdx 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' 
                                : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleQuizSubmit}
                    disabled={quizAnswers.length < selectedModule.quiz.length}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 transition-all"
                  >
                    Submit Quiz
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-6">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${quizResult.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {quizResult.passed ? <CheckCircle size={40} /> : <X size={40} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {quizResult.passed ? 'Congratulations!' : 'Keep Learning'}
                    </h3>
                    <p className="text-slate-500 font-bold mt-1">
                      You scored {quizResult.score}%
                    </p>
                  </div>
                  <p className="text-slate-600 font-medium px-4">
                    {quizResult.passed 
                      ? `You've successfully completed the ${selectedModule.title} module and earned ${selectedModule.pointsReward} points!`
                      : "Don't worry! Review the lessons and try again to earn your points."}
                  </p>
                  <button 
                    onClick={() => setSelectedModule(null)}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold"
                  >
                    Back to Academy
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Academy</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Learn & Earn Rewards</p>
      </div>

      <div className="grid gap-6">
        {modules.map((mod) => {
          const progress = user.moduleProgress.find(p => p.moduleId === mod.id);
          const isCompleted = progress?.completed;

          return (
            <div 
              key={mod.id}
              className="group relative"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-[2rem] translate-y-2 opacity-0 group-hover:opacity-10 transition-all"></div>
              <div className="glass rounded-[2rem] p-6 border-slate-100 hover:border-blue-200 transition-all relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">
                    <Award size={14} className="fill-yellow-700" />
                    <span className="text-[10px] font-black">{mod.pointsReward} PTS</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2">{mod.title}</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">
                  {mod.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold uppercase">{mod.lessons.length * 5} MIN</span>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle size={14} />
                        <span className="text-[10px] font-bold uppercase">Completed</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleStartModule(mod)}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                      isCompleted 
                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95'
                    }`}
                  >
                    {isCompleted ? 'Review' : 'Start'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-20 glass rounded-[2rem] border-dashed border-2 border-slate-200">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No modules available yet</p>
        </div>
      )}
    </div>
  );
};

export default Learn;
