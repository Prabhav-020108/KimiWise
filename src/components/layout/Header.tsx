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
  Save,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useStore } from '../../store';

export const Header: React.FC = () => {
  const { ui, ai, setActiveView, toggleTheme, setSidebarOpen } = useStore();

  const navItems = [
    { id: 'board' as const, label: 'Smart Board', icon: LayoutDashboard },
    { id: 'codelab' as const, label: 'Code Lab', icon: Code2 },
    { id: 'teacher' as const, label: 'Teacher Hub', icon: GraduationCap },
    { id: 'chat' as const, label: 'Gemma Chat', icon: MessageSquare },
  ];

  const aiOnline = ai.isConnected;
  const modelName = ai.activeModel || 'Gemma 4';
  const modeLabel = ai.runtimeMode === 'gemma' ? 'Cloud Mode' : ai.runtimeMode === 'ollama' ? 'Local Mode' : 'Offline';
  const modeColor = ai.runtimeMode === 'gemma' ? '#2563eb' : ai.runtimeMode === 'ollama' ? '#10b981' : '#94a3b8';

  return (
    <header className="h-[52px] border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-40 px-3 md:px-5 flex items-center justify-between gap-3 transition-colors">

      {/* ── Left: Brand + Mobile Toggle ─────────────────────────────────── */}
      {/* ── Left: Menu + Brand ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setSidebarOpen(!ui.isSidebarOpen)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Toggle menu"
        >
          {ui.isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo Card */}
        <div
          onClick={() => setActiveView('board')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs cursor-pointer select-none hover:border-blue-300 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
            {/* Play/kite triangle icon */}
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="font-extrabold text-[15px] text-slate-900 tracking-tight">KimiWise</span>
          <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
            Digital Classroom
          </span>
        </div>
      </div>

      {/* ── Center: AI Mode Badge + Nav Tabs ──────────────────────────────── */}
      <div className="flex items-center gap-3 flex-1 justify-center min-w-0">

        {/* Cloud / Local Mode badge (Trido style) */}
        <div
          className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-all cursor-default"
          style={{
            borderColor: modeColor + '40',
            backgroundColor: modeColor + '10',
            color: modeColor,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: modeColor }}
          />
          <span className="font-bold">{modeLabel}</span>
          <span className="hidden lg:inline text-[10px] font-medium opacity-75">
            {ai.runtimeMode === 'gemma' ? 'Gemini: gemma-4-31b-it' : modelName}
          </span>
        </div>

        {/* Nav tabs */}
        <nav className="hidden md:flex items-center gap-0.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = ui.activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/90'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-blue-600' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Right: AI, Share, Save, User ──────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* KimiWise AI button */}
        <button
          onClick={() => setActiveView('chat')}
          className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/25 active:scale-95"
        >
          <Sparkles size={14} />
          <span>KimiWise AI</span>
        </button>

        {/* Share Button */}
        <button
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all active:scale-95 shadow-xs"
          title="Share classroom"
        >
          <Share2 size={13} className="text-slate-500" />
          <span>Share</span>
        </button>

        {/* Save Button */}
        <button
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all active:scale-95 shadow-xs"
          title="Save whiteboard"
        >
          <Save size={13} className="text-slate-500" />
          <span>Save ⌄</span>
        </button>

        {/* AI Status Indicator */}
        <div
          title={aiOnline ? `Connected: ${modelName}` : 'AI Offline'}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all border ${
            aiOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-500'
              : 'bg-red-50 border-red-200 text-red-400'
          }`}
        >
          {aiOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={ui.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          className="w-7 h-7 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
        >
          {ui.theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
        </button>

        {/* User Avatar */}
        <div
          title="User Profile"
          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm cursor-pointer hover:bg-blue-500 active:scale-95 transition-all"
        >
          G
        </div>
      </div>
    </header>
  );
};
