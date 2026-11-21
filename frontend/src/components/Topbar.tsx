'use client';

import React, { useEffect, useRef } from 'react';
import {
  Menu,
  Moon,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '@/context/ThemeContext';
import { User } from '@/types/lead';

interface TopbarProps {
  user: User;
  searchValue: string;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  onSearchChange: (value: string) => void;
  onOpenMobileMenu: () => void;
  onNewLead: () => void;
  onResetFilters: () => void;
  onRefresh: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Topbar({
  user,
  searchValue,
  hasActiveFilters,
  isRefreshing,
  onSearchChange,
  onOpenMobileMenu,
  onNewLead,
  onResetFilters,
  onRefresh,
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + K focuses global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#111315]/90 sm:px-6">
      {/* Left: Mobile menu + Global Cmd+K Search */}
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads, email, company..."
            aria-label="Global lead search"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-14 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#65c146] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#65c146]/20 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#65c146] dark:focus:bg-[#14171a]"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center rounded-full bg-[#65c146] px-2 py-0.5 text-[11px] font-semibold text-zinc-950 sm:inline-flex">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Center: Quick Action Pills (Desktop) */}
      <div className="hidden items-center gap-2 xl:flex">
        <button
          type="button"
          onClick={onNewLead}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <Plus className="h-3.5 w-3.5 text-[#65c146]" />
          New Lead
        </button>

        <button
          type="button"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Sync
        </button>
      </div>

      {/* Right: Theme Toggle & User Avatar */}
      <div className="flex items-center gap-2.5">
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
        >
          <motion.span
            key={theme}
            initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </motion.span>
        </motion.button>

        <div
          title={`${user.name} (${user.email})`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#65c146]/40 bg-[#65c146]/15 text-xs font-bold text-emerald-700 dark:text-[#7ee05d]"
        >
          {getInitials(user.name)}
        </div>
      </div>
    </header>
  );
}
