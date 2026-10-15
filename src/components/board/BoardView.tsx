import React, { useState } from 'react';
import { CanvasManager } from './CanvasManager';
import { DrawingToolbar } from './DrawingToolbar';
import { DomOverlay } from './DomOverlay';
import { VoiceIsland } from '../voice/VoiceIsland';

export const BoardView: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 1. Fullscreen Fabric.js Canvas Engine */}
      <CanvasManager onCanvasReady={() => setIsReady(true)} />

      {/* 2. Floating Drawing Toolbar (Left) */}
      <DrawingToolbar />

      {/* 3. Rich DOM Widgets & KaTeX Overlay on Canvas */}
      <DomOverlay />

      {/* 4. Voice Island (Bottom Center Dynamic Floating Bar) */}
      <VoiceIsland />

      {/* Canvas Status indicator if loading */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-xs z-0 pointer-events-none">
          <div className="text-xs text-muted-foreground animate-pulse">Initializing smart canvas...</div>
        </div>
      )}
    </div>
  );
};
