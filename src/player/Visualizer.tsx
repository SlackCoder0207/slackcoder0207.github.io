import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useTheme } from '../themes/ThemeProvider';

interface VisualizerProps {
  barCount?: number;
  height?: number;
  className?: string;
}

export function Visualizer({ barCount = 32, height = 48, className }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserData = usePlayerStore((s) => s.analyserData);
  const { theme } = useTheme();
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const data = analyserData;
      if (!data || data.length === 0) return;

      const accent = theme.colors.accent;
      const dim = theme.id === 'clinical' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';

      const step = Math.floor(data.length / barCount);
      const barW = w / barCount - 1;

      for (let i = 0; i < barCount; i++) {
        const idx = i * step;
        const val = data[idx] ?? 0;
        const percent = val / 255;
        const barH = Math.max(1, percent * h * 0.9);

        ctx.fillStyle = percent > 0.3 ? accent : dim;
        ctx.fillRect(i * (barW + 1), h - barH, barW, barH);
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyserData, barCount, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 4}
      height={height}
      className={className}
      style={{ width: '100%', height, imageRendering: 'crisp-edges' }}
    />
  );
}
