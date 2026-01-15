import express, { Application, Request, Response } from 'express';
import { clerkMiddleware } from '@clerk/express'

import registrationRouter from './modules/auth/registration/registration.route';


const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());


// AUTH ROUTES
app.use('/api/v1/auth', registrationRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚍 CARPOOL Backend API',
    version: '1.0.0',
    phase: 'Phase 1 → Phase 2',
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response) => {
  console.error('Server Error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env['NODE_ENV'] === 'development'
        ? err.message
        : undefined,
  });
});

export default app;
