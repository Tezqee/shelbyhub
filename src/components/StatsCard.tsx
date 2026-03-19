'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number; // percent change
  format?: (n: number) => string;
  delay?: number;
}

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    start.current = null;
    const step = (timestamp: number) => {
      if (!start.current) start.current = timestamp;
      const elapsed = timestamp - start.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return current;
}

export function StatsCard({
  label,
  value,
  unit,
  icon: Icon,
  iconColor = '#14b8a6',
  trend,
  format,
  delay = 0,
}: StatsCardProps) {
  const displayed = useCountUp(value);
  const formatted = format ? format(displayed) : displayed.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 24 }}
      className="relative overflow-hidden rounded-2xl bg-void-100/40 border border-white/5 p-5 hover:border-white/10 transition-all group"
    >
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top right, ${iconColor}10 0%, transparent 60%)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        {/* Icon */}
        <div
          className="p-2.5 rounded-xl"
          style={{ background: `${iconColor}18` }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <span
            className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
              trend >= 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-display font-bold text-void-950">
            {formatted}
          </span>
          {unit && <span className="text-sm text-void-600">{unit}</span>}
        </div>
        <p className="text-sm text-void-600 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}
