import { Response, Request, NextFunction } from 'express';
import getCurrentUserService, { UserNotFoundError } from './me.service';

const getCurrentUserController = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
  try {
    // GET USER DATA FROM REQUEST
    const { email } = req.body;

    // FETCH USER PROFILE FROM SERVICE
    const userProfile = await getCurrentUserService(email);

    // RETURN SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      data: userProfile,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof UserNotFoundError) {
      // User authenticated with Clerk but not registered in backend
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_REGISTERED',
          message: 'Please complete registration first',
          action: 'REDIRECT_TO_REGISTRATION',
        },
      });
      return;
    }

    next(error);
  }
};

export default getCurrentUserController;