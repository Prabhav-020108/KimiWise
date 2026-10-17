import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useStore } from '../../store';

// ── Page & Slide indicator bar – bottom left (matches Trido / Google Slides) ──
export const PageBar: React.FC = () => {
  const { canvas, addSlide, setSlide, deleteSlide } = useStore();
  const slides = canvas.slides && canvas.slides.length > 0 ? canvas.slides : [{ id: '1', name: 'Slide 1' }];
  const currentIndex = canvas.currentPageIndex ?? 0;

  return (
    <div className="absolute bottom-4 lg:bottom-6 left-3 lg:left-6 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl px-2.5 py-1.5 pointer-events-auto select-none">
      {/* Prev Slide */}
      <button
        onClick={() => setSlide(Math.max(0, currentIndex - 1))}
        disabled={currentIndex === 0}
        title="Previous Slide"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft size={15} />
      </button>

      {/* Slide number buttons */}
      <div className="flex items-center gap-1 max-w-[200px] overflow-x-auto no-scrollbar">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div key={slide.id || idx} className="relative group">
              <button
                onClick={() => setSlide(idx)}
                title={`Switch to ${slide.name || `Slide ${idx + 1}`}`}
                className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 scale-105'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                {idx + 1}
              </button>

              {/* Delete slide if more than 1 */}
              {slides.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(idx);
                  }}
                  title="Delete Slide"
                  className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-4 h-4 bg-rose-500 text-white rounded-full items-center justify-center hover:bg-rose-600 shadow-xs"
                >
                  <Trash2 size={9} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Slide */}
      <button
        onClick={() => setSlide(Math.min(slides.length - 1, currentIndex + 1))}
        disabled={currentIndex === slides.length - 1}
        title="Next Slide"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight size={15} />
      </button>

      <div className="w-px h-4 bg-slate-200 mx-0.5" />

      {/* Add new slide button */}
      <button
        onClick={addSlide}
        title="Add new slide (+)"
        className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
