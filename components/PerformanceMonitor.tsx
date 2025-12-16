import React, { useEffect, useRef, useState } from 'react';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  particleCount: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  particleCount?: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = false,
  particleCount = 0
}) => {
  console.log('PerformanceMonitor - enabled:', enabled, 'particleCount:', particleCount);

  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    particleCount: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const measurePerformance = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      frameCountRef.current++;

      // Update stats every second
      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        const frameTime = delta / frameCountRef.current;

        setStats({
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
          particleCount
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(measurePerformance);
    };

    animationFrameRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, particleCount]);

  if (!enabled) return null;

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-4 left-4 z-[9999] bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 font-mono text-xs space-y-1 pointer-events-auto">
      <div className="text-gray-400 font-semibold mb-2">Performance Monitor</div>

      <div className="flex items-center gap-2">
        <span className="text-gray-500">FPS:</span>
        <span className={`font-bold ${getFpsColor(stats.fps)}`}>
          {stats.fps}
        </span>
        <span className="text-gray-600 text-[10px]">
          {stats.fps >= 55 ? '✓ Excellent' : stats.fps >= 30 ? '⚠ OK' : '✗ Poor'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-500">Frame:</span>
        <span className="text-white">{stats.frameTime}ms</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-500">Particles:</span>
        <span className="text-white">{stats.particleCount}</span>
      </div>

      <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-gray-600">
        Target: 60 FPS (16.67ms/frame)
      </div>
    </div>
  );
};

export default PerformanceMonitor;
