import {
  Lead,
  LeadFormValues,
  LeadSource,
  LeadStats,
  LeadStatus,
  PaginatedLeadsResponse,
  SortField,
  SortOrder,
  User,
} from '@/types/lead';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TOKEN_STORAGE_KEY = 'lead_manager_token';

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      'Unable to reach the server. Check that the backend API is running and try again.',
      0
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload?.details);
  }

  return payload as T;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface ListLeadsParams {
  search?: string;
  status?: LeadStatus | 'All';
  source?: LeadSource | 'All';
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<AuthPayload>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<AuthPayload>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: User }>('/auth/me'),
  },

  leads: {
    list: (params: ListLeadsParams = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.status && params.status !== 'All') {
        searchParams.set('status', params.status);
      }
      if (params.source && params.source !== 'All') {
        searchParams.set('source', params.source);
      }
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const query = searchParams.toString();
      return request<PaginatedLeadsResponse>(
        `/leads${query ? `?${query}` : ''}`
      );
    },
    stats: () => request<LeadStats>('/leads/stats'),
    create: (data: LeadFormValues) =>
      request<{ data: Lead }>('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<LeadFormValues>) =>
      request<{ data: Lead }>(`/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/leads/${id}`, {
        method: 'DELETE',
      }),
  },
};
