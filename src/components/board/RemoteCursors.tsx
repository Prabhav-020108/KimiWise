import React from 'react';
import { useStore } from '../../store';

export const RemoteCursors: React.FC = () => {
  const remoteCursors = useStore((s) => s.collab.remoteCursors);
  const zoom = useStore((s) => s.canvas.zoom) ?? 1;

  const entries = Object.entries(remoteCursors);
  if (entries.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
      {entries.map(([socketId, cursor]) => {
        // Compute canvas coordinates taking viewport transform into account
        const fCanvas = (window as any).__KIMIWISE_CANVAS__;
        let screenX = cursor.x * zoom;
        let screenY = cursor.y * zoom;

        if (fCanvas && fCanvas.viewportTransform) {
          const vpt = fCanvas.viewportTransform;
          screenX = cursor.x * vpt[0] + vpt[4];
          screenY = cursor.y * vpt[3] + vpt[5];
        }

        const color = cursor.color || '#2563eb';

        return (
          <div
            key={socketId}
            className="absolute transition-all duration-75 ease-out select-none will-change-transform"
            style={{
              left: `${screenX}px`,
              top: `${screenY}px`,
              transform: 'translate(0, 0)',
            }}
          >
            {/* Custom SVG Cursor Arrow */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] -translate-x-1 -translate-y-1"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Name Tag Pill */}
            <div
              className="absolute left-4 top-3 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white shadow-md whitespace-nowrap flex items-center gap-1 border border-white/20 animate-in fade-in duration-150"
              style={{ backgroundColor: color }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              <span>{cursor.name || 'Student'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
