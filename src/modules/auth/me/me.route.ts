import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import getCurrentUserController from './me.controller';

const router = Router();


// GET CURRENT USER PROFILE
// Login is handled by Clerk 
router.get('/me', requireAuth(), getCurrentUserController);

export default router;