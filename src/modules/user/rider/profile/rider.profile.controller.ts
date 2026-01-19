import { Response, Request, NextFunction } from 'express';
import profileRiderService  from './rider.profile.service';



export const profileRiderController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // EXTRACT UPDATE DATA FROM REQ BODY
        const { userId, homeLatitude, homeLongitude, workplaceLatitude, workplaceLongitude, preferredBusStopId } = req.body;

        // CHECK IF AT LEAST ONE FIELD IS PROVIDED
        if (homeLatitude === undefined && homeLongitude === undefined && workplaceLatitude === undefined && workplaceLongitude === undefined && !preferredBusStopId ) {
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
        const updatedUser = await profileRiderService(userId, {  homeLatitude, homeLongitude, workplaceLatitude, workplaceLongitude, preferredBusStopId });

        // RETURN SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Created successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
}