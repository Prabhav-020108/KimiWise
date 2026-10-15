import React from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../../store';

// ── Page indicator bar – bottom left (matches Trido's page navigation exactly) ────────
export const PageBar: React.FC = () => {
  const { canvas } = useStore();
  const currentPage = (canvas.currentPageIndex ?? 0) + 1;

  return (
    <div className="absolute bottom-4 lg:bottom-6 left-3 lg:left-6 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl px-2 py-1.5 pointer-events-auto select-none">
      <button
        title={`Current Page: ${currentPage}`}
        className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-blue-500/30 transition-colors"
      >
        {currentPage}
      </button>

      <button
        title="Add new page"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

