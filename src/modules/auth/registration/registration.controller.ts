import { NextFunction, Request, Response } from 'express';
import registrationService from './registration.service';
import { UserRole } from '../../../../generated/prisma';

const registrationController = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
  try {
    // VALIDATE REQUEST BODY
    const { firstName, lastName, email, role } = req.body;

    if (!firstName || !lastName || !email || !role) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'firstName, lastName, email, and role are required',
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
      firstName,
      lastName,
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
