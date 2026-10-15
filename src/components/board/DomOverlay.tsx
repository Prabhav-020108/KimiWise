import React from 'react';
import { useStore } from '../../store';
import { X, Code, BookOpen } from 'lucide-react';

export const DomOverlay: React.FC = () => {
  const { canvas, setDomElements } = useStore();
  const elements = canvas.domElements || {};

  const handleRemove = (id: string) => {
    const next = { ...elements };
    delete next[id];
    setDomElements(next);
  };

  if (Object.keys(elements).length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {Object.values(elements).map((el) => {
        const left = el.x;
        const top = el.y;

        return (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: `${left}px`,
              top: `${top}px`,
              width: `${el.width || 340}px`,
              pointerEvents: 'auto',
            }}
            className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border shadow-2xl p-4 flex flex-col gap-2 transition-transform duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                {el.componentType === 'code' ? <Code size={14} /> : <BookOpen size={14} />}
                <span>{el.componentType ? el.componentType.toUpperCase() : 'AI CARD'}</span>
              </div>
              <button
                onClick={() => handleRemove(el.id)}
                className="w-5 h-5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            {/* Content */}
            <div
              className="text-xs text-foreground/90 leading-relaxed font-sans prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: el.html }}
            />
          </div>
        );
      })}
    </div>
  );
};
