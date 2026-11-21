'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { LeadStats, LeadStatus } from '@/types/lead';

interface StatsCardsProps {
  stats: LeadStats;
  activeStatus: LeadStatus | 'All';
  onSelectStatus: (status: LeadStatus | 'All') => void;
}

const CARD_CONFIG: Array<{
  key: LeadStatus | 'All';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeBg: string;
}> = [
  {
    key: 'All',
    label: 'Total Leads',
    icon: Layers,
    badgeBg: 'bg-sky-600 text-white shadow-sky-600/25',
  },
  {
    key: 'New',
    label: 'New',
    icon: Sparkles,
    badgeBg: 'bg-blue-600 text-white shadow-blue-600/25',
  },
  {
    key: 'Contacted',
    label: 'Contacted',
    icon: Clock,
    badgeBg: 'bg-orange-500 text-white shadow-orange-500/25',
  },
  {
    key: 'Qualified',
    label: 'Qualified',
    icon: CheckCircle2,
    badgeBg: 'bg-[#65c146] text-zinc-950 shadow-[#65c146]/25',
  },
  {
    key: 'Lost',
    label: 'Lost',
    icon: XCircle,
    badgeBg: 'bg-rose-500 text-white shadow-rose-500/25',
  },
];

export function StatsCards({
  stats,
  activeStatus,
  onSelectStatus,
}: StatsCardsProps) {
  return (
    <section
      aria-label="Lead summary counts"
      className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-5"
    >
      {CARD_CONFIG.map((item, idx) => {
        const Icon = item.icon;
        const count =
          item.key === 'All' ? stats.total : stats.byStatus[item.key];
        const isActive = activeStatus === item.key;

        return (
          <motion.button
            key={item.key}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectStatus(item.key)}
            className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition-colors ${
              isActive
                ? 'border-[#65c146] bg-[#65c146]/[0.06] ring-1 ring-[#65c146]/30 dark:border-[#65c146]/80 dark:bg-[#161b17]'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-zinc-800/90 dark:bg-[#14171a] dark:hover:border-zinc-700'
            }`}
          >
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                {item.label}
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {count.toLocaleString()}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md transition-transform duration-200 group-hover:scale-105 ${item.badgeBg}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </motion.button>
        );
      })}
    </section>
  );
}
