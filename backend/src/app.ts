import Database from 'better-sqlite3';
import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env';
import { AuthController } from './controllers/auth.controller';
import { LeadController } from './controllers/lead.controller';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createAuthRouter } from './routes/auth.routes';
import { createLeadRouter } from './routes/lead.routes';
import { AuthService } from './services/auth.service';
import { LeadService } from './services/lead.service';

export function createApp(db: Database.Database): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin.split(',').map((origin) => origin.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  if (env.nodeEnv !== 'test') {
    app.use(
      '/api/',
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests, please try again shortly.' },
      })
    );
  }

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const authService = new AuthService(db);
  const leadService = new LeadService(db);

  const authController = new AuthController(authService);
  const leadController = new LeadController(leadService);

  app.use('/api/auth', createAuthRouter(authController));
  app.use('/api/leads', createLeadRouter(leadController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
