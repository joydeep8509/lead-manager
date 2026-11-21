'use client';

import React from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Layers,
  LogOut,
  Share2,
  Sparkles,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  LEAD_SOURCES,
  LeadSource,
  LeadStats,
  LeadStatus,
  User,
} from '@/types/lead';

interface SidebarProps {
  user: User;
  stats: LeadStats;
  activeStatus: LeadStatus | 'All';
  activeSource: LeadSource | 'All';
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onSelectStatus: (status: LeadStatus | 'All') => void;
  onSelectSource: (source: LeadSource | 'All') => void;
  onLogout: () => void;
}

const PIPELINE_ITEMS: Array<{
  key: LeadStatus | 'All';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'All', label: 'All Leads', icon: Layers },
  { key: 'New', label: 'New', icon: Sparkles },
  { key: 'Contacted', label: 'Contacted', icon: Clock },
  { key: 'Qualified', label: 'Qualified', icon: CheckCircle2 },
  { key: 'Lost', label: 'Lost', icon: XCircle },
];

export function Sidebar({
  user,
  stats,
  activeStatus,
  activeSource,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onSelectStatus,
  onSelectSource,
  onLogout,
}: SidebarProps) {
  const getCount = (key: LeadStatus | 'All') =>
    key === 'All' ? stats.total : stats.byStatus[key];

  const handleStatusClick = (status: LeadStatus | 'All') => {
    onSelectStatus(status);
    onCloseMobile();
  };

  const handleSourceClick = (source: LeadSource | 'All') => {
    onSelectSource(activeSource === source ? 'All' : source);
    onCloseMobile();
  };

  const sidebarContent = (isMobile: boolean) => {
    const isCompact = !isMobile && collapsed;

    return (
      <div className="flex h-full flex-col bg-white text-slate-700 dark:bg-[#111315] dark:text-zinc-300">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#65c146] text-zinc-950 shadow-sm">
              <Users className="h-4 w-4 stroke-[2.5]" />
            </div>
            {!isCompact && (
              <div className="flex items-baseline gap-1 truncate">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Lead<span className="text-[#65c146]">Flow</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#65c146]">
                  CRM
                </span>
              </div>
            )}
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white"
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {/* Pipeline Section */}
          <div>
            {!isCompact && (
              <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Pipeline
              </p>
            )}
            <ul className="space-y-1">
              {PIPELINE_ITEMS.map(({ key, label, icon: Icon }) => {
                const isActive = activeStatus === key;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => handleStatusClick(key)}
                      title={isCompact ? label : undefined}
                      className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#65c146]/15 text-emerald-700 dark:bg-[#65c146]/15 dark:text-[#7ee05d]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? 'text-[#65c146]'
                              : 'text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                          }`}
                        />
                        {!isCompact && <span className="truncate">{label}</span>}
                      </span>
                      {!isCompact && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                            isActive
                              ? 'bg-[#65c146]/20 text-emerald-700 dark:text-[#7ee05d]'
                              : 'bg-slate-100 text-slate-500 dark:bg-zinc-800/80 dark:text-zinc-400'
                          }`}
                        >
                          {getCount(key)}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sources Section */}
          <div>
            {!isCompact && (
              <div className="mb-2 flex items-center justify-between px-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Sources
                </p>
                {activeSource !== 'All' && (
                  <button
                    type="button"
                    onClick={() => onSelectSource('All')}
                    className="text-[11px] font-medium text-[#65c146] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
            <ul className="space-y-1">
              {LEAD_SOURCES.map((source) => {
                const isActive = activeSource === source;
                const Icon = source === 'Website' ? Globe : Share2;
                return (
                  <li key={source}>
                    <button
                      type="button"
                      onClick={() => handleSourceClick(source)}
                      title={isCompact ? source : undefined}
                      className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? 'text-[#65c146]'
                            : 'text-slate-400 dark:text-zinc-500'
                        }`}
                      />
                      {!isCompact && <span className="truncate">{source}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Bottom Account Footer */}
        <div className="border-t border-slate-200 p-3 dark:border-zinc-800/80">
          {!isCompact && (
            <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-zinc-900/70">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-zinc-100">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            title={isCompact ? 'Sign out' : undefined}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCompact && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-slate-200 transition-[width] duration-200 ease-out dark:border-zinc-800/80 lg:block ${
          collapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent(false)}</div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-10 w-64 border-r border-slate-200 shadow-2xl dark:border-zinc-800"
            >
              {sidebarContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
