import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  audioData: Uint8Array;
  barCount?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isListening,
  audioData,
  barCount = 16,
  width = 160,
  height = 32,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const barWidth = Math.max(3, Math.floor(width / barCount) - 3);

    // KimiWise Indigo gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)'); // indigo-600 low
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.8)'); // indigo-500
    gradient.addColorStop(1, 'rgba(165, 180, 252, 1)'); // indigo-300 light

    ctx.fillStyle = gradient;

    const dataLen = audioData.length;

    for (let i = 0; i < barCount; i++) {
      // Pick frequency bin
      const index = dataLen ? Math.floor((i / barCount) * (dataLen * 0.6)) : 0;
      const value = isListening && dataLen ? audioData[index] || 0 : 0;

      // Scale height
      const percent = Math.pow(value / 255, 1.3);
      let barHeight = Math.max(3, height * percent);

      // Micro-animation jitter when listening to keep it alive
      if (isListening && value < 15) {
        barHeight = Math.max(3, 4 + Math.sin(Date.now() / 150 + i) * 3);
      }

      const x = i * (width / barCount) + 2;
      const y = height - barHeight;

      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x, y, barWidth, barHeight, 3);
      } else {
        ctx.rect(x, y, barWidth, barHeight);
      }
      ctx.fill();
    }
  }, [audioData, isListening, barCount, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
    />
  );
};
