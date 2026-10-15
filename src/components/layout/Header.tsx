import React from 'react';
import {
  LayoutDashboard,
  Code2,
  GraduationCap,
  MessageSquare,
  Moon,
  Sun,
  Menu,
  X,
  Share2,
} from 'lucide-react';
import { useStore } from '../../store';
import { AiStatusBadge } from './AiStatusBadge';

export const Header: React.FC = () => {
  const { ui, setActiveView, toggleTheme, setSidebarOpen, collab } = useStore();

  const navItems = [
    { id: 'board' as const, label: 'Smart Board', icon: LayoutDashboard },
    { id: 'codelab' as const, label: 'Code Lab (OCR)', icon: Code2 },
    { id: 'teacher' as const, label: 'Teacher Hub', icon: GraduationCap },
    { id: 'chat' as const, label: 'Gemma Chat', icon: MessageSquare },
  ];

  return (
    <header className="h-14 border-b border-border/80 bg-card/60 backdrop-blur-xl sticky top-0 z-40 px-3 md:px-5 flex items-center justify-between transition-colors">
      {/* Left: Brand + Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!ui.isSidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground md:hidden transition-colors"
          aria-label="Toggle menu"
        >
          {ui.isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div
          onClick={() => setActiveView('board')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.35)] group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-white text-base tracking-tighter">K</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-foreground">KimiWise</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Gemma 4
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:inline -mt-0.5 font-medium">
              Multimodal Smart Classroom
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = ui.activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-card text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-primary' : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Actions, AI Status, Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Collaboration Room indicator */}
        {collab.roomId && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Share2 size={12} />
            <span>Room: {collab.roomId.slice(0, 6)}</span>
          </div>
        )}

        <AiStatusBadge />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={ui.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl border border-border/70 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all"
        >
          {ui.theme === 'dark' ? (
            <Sun size={15} className="text-amber-400" />
          ) : (
            <Moon size={15} className="text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
