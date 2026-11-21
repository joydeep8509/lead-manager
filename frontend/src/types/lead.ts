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
export type SortField = 'created_at' | 'updated_at' | 'name' | 'company' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Lead {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface LeadFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  status: LeadStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedLeadsResponse {
  data: Lead[];
  pagination: PaginationMeta;
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
}
