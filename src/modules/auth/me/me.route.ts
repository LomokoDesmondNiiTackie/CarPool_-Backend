import { Router } from 'express';
import getCurrentUserController from './me.controller';

const router = Router();


// GET CURRENT USER PROFILE
// Login is handled by Clerk 
router.post('/me', getCurrentUserController);

export default router;