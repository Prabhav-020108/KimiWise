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
  barCount = 20,
  width = 120,
  height = 22,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const barWidth = Math.floor(width / barCount) - 2;
    const dataLen = audioData.length;

    for (let i = 0; i < barCount; i++) {
      const index = dataLen ? Math.floor((i / barCount) * (dataLen * 0.6)) : 0;
      const value = isListening && dataLen ? audioData[index] || 0 : 0;

      let barH = Math.max(2, height * Math.pow(value / 255, 1.2));

      // Keep alive with subtle idle animation when volume is very low
      if (isListening && value < 12) {
        barH = Math.max(2, 3 + Math.sin(Date.now() / 120 + i * 0.7) * 2.5);
      }

      const x = i * (width / barCount) + 1;
      const y = (height - barH) / 2; // center-aligned bars

      ctx.fillStyle = '#2563eb';
      ctx.globalAlpha = 0.75 + (barH / height) * 0.25;

      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x, y, barWidth, barH, 2);
      } else {
        ctx.rect(x, y, barWidth, barH);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [audioData, isListening, barCount, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded ${className}`}
    />
  );
};
