import { Response, Request, NextFunction } from 'express';
import driverDeleteService from './driver.delete.service';


export const driverDeleteController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // GET USER ID FROM REQUEST BODY
        const { userId } = req.body;
        
        // CALL SERVICE TO DELETE RIDER ACCOUNT
        await driverDeleteService(userId);

        // RETURN SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            message: 'Driver account deleted successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
}