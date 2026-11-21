import Database from 'better-sqlite3';
import { AppError } from '../middleware/errorHandler';
import {
  CreateLeadInput,
  LEAD_STATUSES,
  LeadStatus,
  ListLeadsQuery,
  UpdateLeadInput,
} from '../validators/lead.validator';

export interface Lead {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface PaginatedLeads {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
}

const SORT_COLUMN_MAP: Record<ListLeadsQuery['sortBy'], string> = {
  created_at: 'created_at',
  updated_at: 'updated_at',
  name: 'name COLLATE NOCASE',
  company: 'company COLLATE NOCASE',
  status: 'status',
};

export class LeadService {
  constructor(private readonly db: Database.Database) {}

  list(userId: number, query: ListLeadsQuery): PaginatedLeads {
    const conditions: string[] = ['user_id = ?'];
    const params: unknown[] = [userId];

    if (query.status !== 'All') {
      conditions.push('status = ?');
      params.push(query.status);
    }

    if (query.source !== 'All') {
      conditions.push('source = ?');
      params.push(query.source);
    }

    if (query.search) {
      conditions.push(
        '(name LIKE ? COLLATE NOCASE OR email LIKE ? COLLATE NOCASE OR company LIKE ? COLLATE NOCASE)'
      );
      const pattern = `%${query.search}%`;
      params.push(pattern, pattern, pattern);
    }

    const whereClause = conditions.join(' AND ');
    const sortColumn = SORT_COLUMN_MAP[query.sortBy];
    const sortDirection = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (query.page - 1) * query.limit;

    const countRow = this.db
      .prepare(`SELECT COUNT(*) as total FROM leads WHERE ${whereClause}`)
      .get(...params) as { total: number };

    const rows = this.db
      .prepare(
        `SELECT id, user_id, name, email, phone, company, source, status, created_at, updated_at
         FROM leads
         WHERE ${whereClause}
         ORDER BY ${sortColumn} ${sortDirection}, id DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, query.limit, offset) as Lead[];

    const totalPages = Math.max(1, Math.ceil(countRow.total / query.limit));

    return {
      data: rows,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: countRow.total,
        totalPages,
      },
    };
  }

  getStats(userId: number): LeadStats {
    const rows = this.db
      .prepare(
        `SELECT status, COUNT(*) as count
         FROM leads
         WHERE user_id = ?
         GROUP BY status`
      )
      .all(userId) as Array<{ status: LeadStatus; count: number }>;

    const byStatus: Record<LeadStatus, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Lost: 0,
    };

    let total = 0;
    for (const row of rows) {
      if (LEAD_STATUSES.includes(row.status)) {
        byStatus[row.status] = row.count;
        total += row.count;
      }
    }

    return { total, byStatus };
  }

  getById(userId: number, leadId: number): Lead {
    const lead = this.db
      .prepare(
        `SELECT id, user_id, name, email, phone, company, source, status, created_at, updated_at
         FROM leads
         WHERE id = ? AND user_id = ?`
      )
      .get(leadId, userId) as Lead | undefined;

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    return lead;
  }

  create(userId: number, input: CreateLeadInput): Lead {
    const result = this.db
      .prepare(
        `INSERT INTO leads (user_id, name, email, phone, company, source, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        userId,
        input.name,
        input.email,
        input.phone,
        input.company,
        input.source,
        input.status
      );

    return this.getById(userId, Number(result.lastInsertRowid));
  }

  update(userId: number, leadId: number, input: UpdateLeadInput): Lead {
    const existing = this.getById(userId, leadId);

    const updated = {
      name: input.name ?? existing.name,
      email: input.email ?? existing.email,
      phone: input.phone ?? existing.phone,
      company: input.company ?? existing.company,
      source: input.source ?? existing.source,
      status: input.status ?? existing.status,
    };

    this.db
      .prepare(
        `UPDATE leads
         SET name = ?, email = ?, phone = ?, company = ?, source = ?, status = ?, updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`
      )
      .run(
        updated.name,
        updated.email,
        updated.phone,
        updated.company,
        updated.source,
        updated.status,
        leadId,
        userId
      );

    return this.getById(userId, leadId);
  }

  delete(userId: number, leadId: number): void {
    const result = this.db
      .prepare('DELETE FROM leads WHERE id = ? AND user_id = ?')
      .run(leadId, userId);

    if (result.changes === 0) {
      throw new AppError('Lead not found', 404);
    }
  }
}
