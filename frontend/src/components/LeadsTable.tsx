'use client';

import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Mail,
  Pencil,
  Phone,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  Lead,
  LeadSource,
  LeadStatus,
  PaginationMeta,
  SortField,
  SortOrder,
} from '@/types/lead';
import { StatusBadge } from './StatusBadge';

export type ViewMode = 'list' | 'grid';

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  viewMode: ViewMode;
  searchInput: string;
  statusFilter: LeadStatus | 'All';
  sourceFilter: LeadSource | 'All';
  pagination: PaginationMeta;
  sortBy: SortField;
  sortOrder: SortOrder;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: LeadStatus | 'All') => void;
  onSourceFilterChange: (source: LeadSource | 'All') => void;
  onSort: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onQuickStatusChange: (lead: Lead, status: LeadStatus) => Promise<void>;
}

const AVATAR_TONES = [
  'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
];

function getAvatarTone(id: number): string {
  return AVATAR_TONES[id % AVATAR_TONES.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function LeadsTable({
  leads,
  loading,
  viewMode,
  searchInput,
  statusFilter,
  sourceFilter,
  pagination,
  sortBy,
  sortOrder,
  onViewModeChange,
  onSearchChange,
  onStatusFilterChange,
  onSourceFilterChange,
  onSort,
  onPageChange,
  onEdit,
  onDelete,
  onQuickStatusChange,
}: LeadsTableProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return (
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
      );
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-[#65c146]" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-[#65c146]" />
    );
  };

  const startItem =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800/90 dark:bg-[#14171a]">
      {/* Integrated Toolbar (Matching CRM reference) */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-zinc-800/80 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads..."
            aria-label="Filter leads table"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-8 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#65c146] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#65c146]/20 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#65c146]"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear table search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Filter Dropdown */}
          <div className="relative flex items-center">
            <Building2 className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400 dark:text-zinc-400" />
            <select
              aria-label="Filter by source"
              value={sourceFilter}
              onChange={(e) =>
                onSourceFilterChange(e.target.value as LeadSource | 'All')
              }
              className="rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs font-medium text-slate-700 transition focus:border-[#65c146] focus:outline-none dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-200"
            >
              <option value="All">All Sources</option>
              {LEAD_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative flex items-center">
            <Tag className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400 dark:text-zinc-400" />
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as LeadStatus | 'All')
              }
              className="rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs font-medium text-slate-700 transition focus:border-[#65c146] focus:outline-none dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-200"
            >
              <option value="All">All Statuses</option>
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Grid / List View Switcher */}
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 dark:border-zinc-800 dark:bg-[#1a1d21]">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              title="Grid view"
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                viewMode === 'grid'
                  ? 'bg-[#65c146] text-zinc-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              title="List view"
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                viewMode === 'list'
                  ? 'bg-[#65c146] text-zinc-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && leads.length === 0 ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 dark:border-zinc-800/60 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-zinc-800" />
                <div className="space-y-2">
                  <div className="h-3.5 w-32 rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="h-2.5 w-24 rounded bg-slate-200/70 dark:bg-zinc-800/70" />
                </div>
              </div>
              <div className="hidden h-3 w-40 rounded bg-slate-200 dark:bg-zinc-800 sm:block" />
              <div className="h-6 w-20 rounded-md bg-slate-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : !loading && leads.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-semibold text-slate-800 dark:text-zinc-100">
            No matching leads found
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Click &ldquo;+ Add Lead&rdquo; to create your first prospect or
            adjust your filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Responsive Card Grid View */
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead, idx) => (
            <motion.article
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-[#65c146]/50 dark:border-zinc-800/80 dark:bg-[#191d21] dark:hover:border-[#65c146]/40"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${getAvatarTone(
                        lead.id
                      )}`}
                    >
                      {getInitials(lead.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {lead.name}
                      </h3>
                      <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                        {lead.company || 'Independent'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-zinc-500" />
                    <span className="truncate">{lead.email}</span>
                  </p>
                  {lead.phone && (
                    <p className="flex items-center gap-2 truncate">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-zinc-500" />
                      <span>{lead.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {lead.source}
                  </span>
                  <select
                    aria-label={`Change status for ${lead.name}`}
                    value={lead.status}
                    onChange={(e) =>
                      onQuickStatusChange(lead, e.target.value as LeadStatus)
                    }
                    className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-600 focus:border-[#65c146] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(lead)}
                    title="Edit lead"
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(lead)}
                    title="Delete lead"
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-100 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-500/15 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-zinc-800/80">
            <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-[#111315]/70 dark:text-zinc-500">
              <tr>
                <th className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => onSort('name')}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-zinc-200"
                  >
                    Lead {renderSortIcon('name')}
                  </button>
                </th>
                <th className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => onSort('company')}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-zinc-200"
                  >
                    Company {renderSortIcon('company')}
                  </button>
                </th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Source</th>
                <th className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => onSort('status')}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-zinc-200"
                  >
                    Status {renderSortIcon('status')}
                  </button>
                </th>
                <th className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => onSort('created_at')}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-zinc-200"
                  >
                    Added {renderSortIcon('created_at')}
                  </button>
                </th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {leads.map((lead, idx) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18, delay: idx * 0.02 }}
                  className="group transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/35"
                >
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${getAvatarTone(
                          lead.id
                        )}`}
                      >
                        {getInitials(lead.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-zinc-100">
                          {lead.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-500 sm:hidden">
                          {lead.company || 'Independent'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 dark:text-zinc-300">
                    {lead.company || (
                      <span className="text-slate-400 dark:text-zinc-600">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-800 dark:text-zinc-200">
                      {lead.email}
                    </p>
                    {lead.phone && (
                      <p className="text-xs text-slate-500 dark:text-zinc-500">
                        {lead.phone}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-zinc-800/90 dark:text-zinc-300">
                      {lead.source}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={lead.status} />
                      <select
                        aria-label={`Change status for ${lead.name}`}
                        value={lead.status}
                        onChange={(e) =>
                          onQuickStatusChange(
                            lead,
                            e.target.value as LeadStatus
                          )
                        }
                        className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-600 transition focus:border-[#65c146] focus:outline-none dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-300"
                      >
                        {LEAD_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500 dark:text-zinc-500">
                    {new Date(`${lead.created_at}Z`).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(lead)}
                        title="Edit lead"
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(lead)}
                        title="Delete lead"
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-100 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-500/15 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 text-xs text-slate-600 dark:border-zinc-800/80 dark:bg-[#111315]/60 dark:text-zinc-400 sm:flex-row">
          <p>
            Showing{' '}
            <span className="font-semibold text-slate-900 dark:text-zinc-200">
              {startItem}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900 dark:text-zinc-200">
              {endItem}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-900 dark:text-zinc-200">
              {pagination.total}
            </span>{' '}
            leads
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="px-2 font-medium text-slate-700 dark:text-zinc-300">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
