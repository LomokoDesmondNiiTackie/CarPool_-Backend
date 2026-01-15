import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import registrationController from './registration.controller';

const router = Router();

// REGISTRATION ROUTE
// USER MUST BE AUTHENTICATED FIRST WITH CLERK
router.post('/register', requireAuth(), registrationController);

export default router;