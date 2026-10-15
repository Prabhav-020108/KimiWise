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
      <aside className="w-14 border-r border-border/80 bg-card/40 backdrop-blur-md hidden md:flex flex-col items-center py-3 justify-between shrink-0 transition-all">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>

          <div className="w-8 h-px bg-border/80 my-1" />

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
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Settings size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-60 border-r border-border/80 bg-card/40 backdrop-blur-md hidden md:flex flex-col justify-between p-3 shrink-0 transition-all">
      <div className="space-y-4">
        {/* Header inside sidebar */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Workspace
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Smart Board Quick Tools */}
        <div className="pt-2">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Classroom Tools
          </span>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              onClick={() => setActiveView('board')}
              className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-colors"
            >
              <Clock size={13} className="text-amber-400" />
              <span>Timer</span>
            </button>
            <button
              onClick={() => setActiveView('board')}
              className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-colors"
            >
              <Calculator size={13} className="text-emerald-400" />
              <span>Calc</span>
            </button>
            <button
              onClick={() => setActiveView('board')}
              className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-colors"
            >
              <GitBranch size={13} className="text-purple-400" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setActiveView('board')}
              className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-colors"
            >
              <Volume2 size={13} className="text-indigo-400" />
              <span>Voice</span>
            </button>
          </div>
        </div>

        {/* Active Lesson Plan widget */}
        {lesson.activeLessonPlan && (
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400">
              <Sparkles size={12} />
              <span>Active Lesson</span>
            </div>
            <p className="mt-1 font-semibold text-foreground truncate">{lesson.activeLessonPlan.topic}</p>
            <span className="text-[10px] text-muted-foreground">{lesson.activeLessonPlan.subject}</span>
          </div>
        )}
      </div>

      {/* Footer / Settings */}
      <div className="pt-2 border-t border-border/60">
        <button
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            ui.activeView === 'settings'
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Settings size={16} />
          <span>System & Models</span>
        </button>

        <div className="mt-3 px-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>v1.0.0 • Gemma 4</span>
          <span className="text-emerald-400 font-medium">Ready</span>
        </div>
      </div>
    </aside>
  );
};
