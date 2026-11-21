'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Lead } from '@/types/lead';

interface DeleteModalProps {
  lead: Lead | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteModal({
  lead,
  deleting,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  useEffect(() => {
    if (!lead) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [lead, deleting, onCancel]);

  return (
    <AnimatePresence>
      {lead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !deleting && onCancel()}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-[#14171a]"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="delete-modal-title"
                  className="text-base font-semibold text-slate-900 dark:text-white"
                >
                  Delete lead?
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                  Are you sure you want to permanently remove{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {lead.name}
                  </span>
                  {lead.company ? ` (${lead.company})` : ''}? This action cannot
                  be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                disabled={deleting}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete Lead'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
