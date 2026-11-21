import { LeadStatus } from '@/types/lead';

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: 'border-blue-500/40 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400',
  Contacted:
    'border-amber-500/40 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400',
  Qualified:
    'border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400',
  Lost: 'border-rose-500/40 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-400',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium tracking-wide ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
