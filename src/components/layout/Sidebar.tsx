import React from 'react';
import {
  LayoutDashboard,
  Code2,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Settings,
  Clock,
  Calculator,
  GitBranch,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store';

export const Sidebar: React.FC = () => {
  const { ui, setActiveView, setSidebarOpen, lesson } = useStore();

  const primaryNav = [
    { id: 'board' as const, label: 'Whiteboard', icon: LayoutDashboard },
    { id: 'codelab' as const, label: 'Code Lab (OCR)', icon: Code2 },
    { id: 'teacher' as const, label: 'Teacher Hub', icon: GraduationCap },
    { id: 'quiz' as const, label: 'Quiz Arena', icon: HelpCircle },
    { id: 'chat' as const, label: 'AI Chat Panel', icon: MessageSquare },
  ];

  if (!ui.isSidebarOpen) {
    return (
      <aside className="w-14 border-r border-slate-200/80 bg-white/95 backdrop-blur-xl hidden md:flex flex-col items-center py-3 justify-between shrink-0 select-none z-30 transition-all">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>

          <div className="w-8 h-px bg-slate-200/80 my-1" />

          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = ui.activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={item.label}
                className={`p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100/80'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setActiveView('settings')}
          title="Settings"
          className={`p-2.5 rounded-xl transition-colors ${
            ui.activeView === 'settings'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
          }`}
        >
          <Settings size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-60 border-r border-slate-200/80 bg-white/95 backdrop-blur-xl hidden md:flex flex-col justify-between p-3.5 shrink-0 select-none z-30 transition-all">
      <div className="space-y-4">
        {/* Header inside sidebar */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = ui.activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Classroom Tools */}
        <div className="pt-2">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Classroom Tools
          </span>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              onClick={() => setActiveView('board')}
              className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all"
            >
              <Clock size={13} className="text-amber-500" />
              <span>Timer</span>
            </button>
            <button
              onClick={() => setActiveView('board')}
              className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all"
            >
              <Calculator size={13} className="text-emerald-500" />
              <span>Calc</span>
            </button>
            <button
              onClick={() => setActiveView('board')}
              className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all"
            >
              <GitBranch size={13} className="text-blue-500" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setActiveView('board')}
              className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all"
            >
              <Volume2 size={13} className="text-indigo-500" />
              <span>Voice</span>
            </button>
          </div>
        </div>

        {/* Active Lesson Plan widget */}
        {lesson.activeLessonPlan && (
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-700">
              <Sparkles size={13} />
              <span>Active Lesson</span>
            </div>
            <p className="mt-1 font-bold text-slate-800 truncate">{lesson.activeLessonPlan.topic}</p>
            <span className="text-[10px] text-slate-500 font-medium">{lesson.activeLessonPlan.subject}</span>
          </div>
        )}
      </div>

      {/* Footer / Settings */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            ui.activeView === 'settings'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <Settings size={16} />
          <span>System & Models</span>
        </button>

        <div className="mt-3 px-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>v1.0.0 • Gemma 4</span>
          <span className="text-emerald-500 font-bold">Ready</span>
        </div>
      </div>
    </aside>
  );
};
