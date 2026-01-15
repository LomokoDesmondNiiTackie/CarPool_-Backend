import { NextFunction, Request, Response } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import registrationService from './registration.service';
import { UserRole } from '../../../../generated/prisma';

const registrationController = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
  try {
    // GET CLERK USER ID
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    // GET CLERK USER DATA
    const clerkUser = await clerkClient.users.getUser(userId);

    // Extract email (Clerk stores emails in an array)
    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email not found in Clerk account',
        },
      });
      return;
    }

    // VALIDATE REQUEST BODY
    const { fullName, role } = req.body;

    if (!fullName || !role) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'fullName and role are required',
        },
      });
      return;
    }

    // Validate role
    if (!['RIDER', 'DRIVER', 'ADMIN'].includes(role)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Role must be RIDER, DRIVER, or ADMIN',
        },
      });
      return;
    }

    // CALL SERVICE
    const result = await registrationService({
      clerkUserId: userId,
      fullName,
      email,
      role: role as UserRole,
    });

    // RETURN SUCCESS
    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export default registrationController;
