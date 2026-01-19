import { Router } from 'express';
import registrationController from './registration.controller';

const router = Router();

// REGISTRATION ROUTE
// USER MUST BE AUTHENTICATED FIRST WITH CLERK
router.post('/register', registrationController);

export default router;