import express, { Application, Request, Response } from 'express';
import { clerkMiddleware } from '@clerk/express'

import registrationRouter from './modules/auth/registration/registration.route';
import meRouter from './modules/auth/me/me.route';
import riderUpdateRouter from '@modules/user/rider/update/rider.update.route';
import riderDeleteRouter from "@modules/user/rider/delete/rider.delete.route"
import driverUpdateRouter from '@modules/user/driver/update/driver.update.route';
import driverDeleteRouter from "@modules/user/driver/delete/driver.delete.route";
import riderProfileRouter from '@modules/user/rider/profile/rider.profile.route';
import driverProfileRouter from "@modules/user/driver/profile/driver.profile.route";
import bookRoute from '@modules/bookings/book/book.route';



const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

// ==================================
// ROUTES
// ==================================

// AUTH ROUTES
app.use('/api/v1/auth', registrationRouter);
app.use('/api/v1/auth', meRouter);
// UPDATE AND DELETE ( RIDER || DRIVER )
app.use("/api/v1", riderUpdateRouter)
app.use("/api/v1", riderDeleteRouter)
app.use("/api/v1", driverUpdateRouter)
app.use("/api/v1", driverDeleteRouter)
//RIDER AND DRIVER PROFILE
app.use("/api/v1", riderProfileRouter)
app.use("/api/v1", driverProfileRouter)
// BOOKING ROUTES
app.use('/api/v1', bookRoute);










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
