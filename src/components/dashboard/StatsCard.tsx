import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title:   string;
  value:   string | number;
  icon:    LucideIcon;
  color:   'brand' | 'accent' | 'green' | 'amber';
  trend?:  string;
  delay?:  number;
}

const colorMap = {
  brand:  { bg: 'bg-brand-500/10',  icon: 'text-brand-500',  glow: 'shadow-glow-brand' },
  accent: { bg: 'bg-accent-500/10', icon: 'text-accent-500', glow: 'shadow-glow-accent' },
  green:  { bg: 'bg-green-500/10',  icon: 'text-green-500',  glow: '' },
  amber:  { bg: 'bg-amber-500/10',  icon: 'text-amber-500',  glow: '' },
};

export default function StatsCard({ title, value, icon: Icon, color, trend, delay = 0 }: Props) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <p className="font-display font-bold text-3xl">{value}</p>
          {trend && <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.glow}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
