import React, { useState } from 'react';
import { TeacherDashboard } from './TeacherDashboard';
import { LessonPlanner } from './LessonPlanner';
import { useStore } from '../../store';
import type { LessonStep } from '../../types';

export const TeacherView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner'>('dashboard');
  const { setActiveView } = useStore();

  const handleNavigateToBoard = (_step: LessonStep) => {
    setActiveView('board');
  };

  const handleNavigateToQuiz = (_topic: string) => {
    setActiveView('quiz');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* ── Sub-navigation bar ──────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Classroom Roster & Analytics
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            AI Lesson Planner
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
          Teacher Intelligence Hub • Gemma 4 Powered
        </div>
      </div>

      {/* ── Tab View Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' ? (
          <TeacherDashboard
            onOpenLessonPlanner={() => setActiveTab('planner')}
            onTargetedQuiz={handleNavigateToQuiz}
          />
        ) : (
          <LessonPlanner
            onBackToDashboard={() => setActiveTab('dashboard')}
            onNavigateToBoard={handleNavigateToBoard}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherView;
