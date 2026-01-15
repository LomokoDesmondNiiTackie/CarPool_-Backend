import { Response, Request, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import updateRiderService  from './rider.update.service';



export const updateRiderController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // GET USER ID FROM REQ OBJECT (SET BY AUTH MIDDLEWARE)
        const { userId } = getAuth(req);

        // CHECK AUTHENTICATION
        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
                },
            });
            return;
        };

        // EXTRACT UPDATE DATA FROM REQ BODY
        const { firstName, lastName, email, phoneNumber } = req.body;

        // CALL SERVICE TO UPDATE RIDER INFORMATION
        await updateRiderService(userId, { firstName, lastName, email, phoneNumber });

        // RETURN SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            message: 'Updated successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
}