'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ApiError } from '@/lib/api';
import { FieldErrors, validateLeadForm } from '@/lib/validation';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  Lead,
  LeadFormValues,
} from '@/types/lead';

interface LeadModalProps {
  isOpen: boolean;
  initialLead: Lead | null;
  onClose: () => void;
  onSubmit: (values: LeadFormValues) => Promise<void>;
}

const EMPTY_FORM: LeadFormValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'Website',
  status: 'New',
};

export function LeadModal({
  isOpen,
  initialLead,
  onClose,
  onSubmit,
}: LeadModalProps) {
  const [values, setValues] = useState<LeadFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialLead) {
        setValues({
          name: initialLead.name,
          email: initialLead.email,
          phone: initialLead.phone,
          company: initialLead.company,
          source: initialLead.source,
          status: initialLead.status,
        });
      } else {
        setValues(EMPTY_FORM);
      }
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, initialLead]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, submitting, onClose]);

  const handleChange = (field: keyof LeadFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateLeadForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        company: values.company.trim(),
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
        if (err.details) {
          const mapped: FieldErrors = {};
          for (const [key, messages] of Object.entries(err.details)) {
            if (messages[0]) {
              mapped[key as keyof LeadFormValues] = messages[0];
            }
          }
          setErrors((prev) => ({ ...prev, ...mapped }));
        }
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500/60 dark:bg-rose-500/5 dark:text-white'
        : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#65c146] focus:ring-[#65c146]/20 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#65c146]'
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !submitting && onClose()}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#14171a]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-zinc-800/80">
              <div>
                <h2
                  id="lead-modal-title"
                  className="text-base font-semibold text-slate-900 dark:text-white"
                >
                  {initialLead ? 'Edit Lead' : 'Add New Lead'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {initialLead
                    ? 'Update contact information or pipeline stage.'
                    : 'Capture a new prospect in your sales pipeline.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
              {serverError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  {serverError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="lead-name"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
                  >
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    value={values.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Jordan Lee"
                    className={inputClass(Boolean(errors.name))}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lead-email"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
                  >
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jordan@company.com"
                    className={inputClass(Boolean(errors.email))}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="lead-phone"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
                  >
                    Phone
                  </label>
                  <input
                    id="lead-phone"
                    type="tel"
                    value={values.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 555-234-5678"
                    className={inputClass(Boolean(errors.phone))}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lead-company"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
                  >
                    Company
                  </label>
                  <input
                    id="lead-company"
                    type="text"
                    value={values.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Acme Corp"
                    className={inputClass(Boolean(errors.company))}
                  />
                  {errors.company && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="lead-source"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
                  >
                    Source <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="lead-source"
                    value={values.source}
                    onChange={(e) => handleChange('source', e.target.value)}
                    className={inputClass(false)}
                  >
                    {LEAD_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="lead-status"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
                  >
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="lead-status"
                    value={values.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={inputClass(false)}
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#65c146] px-5 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-[#54ad36] disabled:opacity-60"
                >
                  {submitting
                    ? 'Saving...'
                    : initialLead
                      ? 'Save Changes'
                      : 'Create Lead'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
