import { createApp } from './app';
import { createDatabase } from './config/db';
import { env } from './config/env';

const db = createDatabase(env.databasePath);
const app = createApp(db);

const server = app.listen(env.port, () => {
  console.log(`Lead Manager API running on http://localhost:${env.port}`);
});

function shutdown(signal: string): void {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
