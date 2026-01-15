import { config } from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';

// Load environment variables
config();

const PORT = process.env['PORT'] ?? 3000;

// CREATE HTTP SERVER AND INTEGRATE WITH EXPRESS APP
const httpServer = http.createServer(app);

// INITIALIZE SOCKET.IO SERVER
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // Adjust this in production for security
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  },
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.info(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.info(`Socket disconnected: ${socket.id}`);
  });
});

const server = httpServer.listen(PORT, () => {
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

