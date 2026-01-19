import { Response, Request, NextFunction } from 'express';
import riderDeleteService from './rider.delete.service';


export const riderDeleteController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // GET USER ID FROM REQ BODY
        const { userId } = req.body;

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

        // CALL SERVICE TO DELETE RIDER ACCOUNT
        await riderDeleteService(userId);

        // RETURN SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            message: 'Rider account deleted successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
}