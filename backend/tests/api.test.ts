import Database from 'better-sqlite3';
import { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { createDatabase } from '../src/config/db';

process.env.NODE_ENV = 'test';

describe('Lead Manager API', () => {
  let db: Database.Database;
  let app: Express;
  let userAToken: string;
  let userBToken: string;
  let createdLeadId: number;

  beforeAll(() => {
    db = createDatabase(':memory:');
    app = createApp(db);
  });

  afterAll(() => {
    db.close();
  });

  it('returns healthy status on /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('registers a user and rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice Sales',
      email: 'alice@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('alice@example.com');
    userAToken = res.body.token;

    const dup = await request(app).post('/api/auth/register').send({
      name: 'Alice Duplicate',
      email: 'alice@example.com',
      password: 'Password123',
    });
    expect(dup.status).toBe(409);
  });

  it('logs in an existing user and rejects bad credentials', async () => {
    const ok = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'Password123',
    });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();

    const bad = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'WrongPassword',
    });
    expect(bad.status).toBe(401);
  });

  it('blocks unauthenticated access to /api/leads', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(401);
  });

  it('validates lead input on creation', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: '',
        email: 'not-an-email',
        source: 'InvalidSource',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toBeDefined();
  });

  it('creates, lists, searches, filters by status and source, updates, and summarizes leads', async () => {
    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Jordan Lee',
        email: 'jordan@acme.io',
        phone: '+1 555-234-5678',
        company: 'Acme Corp',
        source: 'Website',
        status: 'New',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Jordan Lee');
    createdLeadId = createRes.body.data.id;

    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Priya Sharma',
        email: 'priya@globex.com',
        phone: '+91 98765 43210',
        company: 'Globex',
        source: 'Referral',
        status: 'Qualified',
      });

    const listRes = await request(app)
      .get('/api/leads?search=jordan&status=New&source=Website&sortBy=name&sortOrder=asc&page=1&limit=10')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].email).toBe('jordan@acme.io');
    expect(listRes.body.pagination.total).toBe(1);

    const patchRes = await request(app)
      .patch(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ status: 'Contacted' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('Contacted');

    const statsRes = await request(app)
      .get('/api/leads/stats')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.total).toBe(2);
    expect(statsRes.body.byStatus.Contacted).toBe(1);
    expect(statsRes.body.byStatus.Qualified).toBe(1);
  });

  it('isolates leads between different users', async () => {
    const regB = await request(app).post('/api/auth/register').send({
      name: 'Bob Sales',
      email: 'bob@example.com',
      password: 'Password123',
    });
    userBToken = regB.body.token;

    const listB = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(listB.status).toBe(200);
    expect(listB.body.data).toHaveLength(0);

    const getOther = await request(app)
      .get(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(getOther.status).toBe(404);
  });

  it('deletes a lead and returns 404 on subsequent lookup', async () => {
    const delRes = await request(app)
      .delete(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(delRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(getRes.status).toBe(404);
  });
});
