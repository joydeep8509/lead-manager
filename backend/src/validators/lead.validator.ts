import { z } from 'zod';

export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'] as const;
export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Outreach',
  'Event',
  'Other',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];

const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

export const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Lead name is required')
    .max(120, 'Name must be under 120 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  phone: z
    .string()
    .trim()
    .refine((val) => val === '' || phoneRegex.test(val), {
      message: 'Please enter a valid phone number (7-20 digits)',
    })
    .optional()
    .default(''),
  company: z
    .string()
    .trim()
    .max(120, 'Company name must be under 120 characters')
    .optional()
    .default(''),
  source: z.enum(LEAD_SOURCES, {
    errorMap: () => ({ message: 'Please select a valid lead source' }),
  }),
  status: z
    .enum(LEAD_STATUSES, {
      errorMap: () => ({
        message: 'Status must be New, Contacted, Qualified, or Lost',
      }),
    })
    .optional()
    .default('New'),
});

export const updateLeadSchema = createLeadSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const listLeadsQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  status: z
    .enum(['All', ...LEAD_STATUSES])
    .optional()
    .default('All'),
  source: z
    .enum(['All', ...LEAD_SOURCES])
    .optional()
    .default('All'),
  sortBy: z
    .enum(['created_at', 'updated_at', 'name', 'company', 'status'])
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const leadIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid lead ID'),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
