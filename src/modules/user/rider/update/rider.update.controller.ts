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
        const { firstName, lastName, phoneNumber, homeLatitude, homeLongitude, workplaceLatitude, workplaceLongitude, preferredBusStopId } = req.body;

        // CHECK IF AT LEAST ONE FIELD IS PROVIDED
        if (!firstName && !lastName && !phoneNumber && homeLatitude === undefined && homeLongitude === undefined && workplaceLatitude === undefined && workplaceLongitude === undefined && !preferredBusStopId ) {
        res.status(400).json({
            success: false,
            error: {
            code: 'NO_UPDATE_DATA',
            message: 'At least one field must be provided for update',
            },
        });
        return;
        }

        // CALL SERVICE TO UPDATE RIDER INFORMATION
        const updatedUser = await updateRiderService(userId, { firstName, lastName, phoneNumber, homeLatitude, homeLongitude, workplaceLatitude, workplaceLongitude, preferredBusStopId });

        // RETURN SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Updated successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
}