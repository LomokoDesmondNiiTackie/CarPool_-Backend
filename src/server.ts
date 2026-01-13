import { config } from 'dotenv';
import app from './app';

// Load environment variables
config();

const PORT = process.env['PORT'] ?? 3000;

const server = app.listen(PORT, () => {
  console.info(`
  ****************************************
  ****************************************
  **                                    **
  **  CARPOOL Backend Server Started    **
  **                                    **
  ****************************************
  ****************************************
  **                                    **
  **  Environment: ${process.env['NODE_ENV']?.toUpperCase() || 'DEVELOPMENT'}          **
  **  Port: ${PORT}                        **
  **  Status: Running                   **
  **                                    **
  ****************************************
  ****************************************
  `);
});

// Graceful shutdown
const shutdown = (signal: string): void => {
  console.info(`${signal} received: closing HTTP server`);

  server.close(() => {
    console.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
