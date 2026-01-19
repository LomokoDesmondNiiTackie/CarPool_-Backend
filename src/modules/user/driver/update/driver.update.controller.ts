import { Response, Request, NextFunction } from 'express';
import updateDriverService  from './driver.update.service';



export const updateDriverController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // EXTRACT UPDATE DATA FROM REQ BODY
        const { userId,firstName, lastName, phoneNumber, companyName, licenseNumber } = req.body;

        // CHECK IF AT LEAST ONE FIELD IS PROVIDED
        if (!firstName && !lastName && !phoneNumber && companyName === undefined && licenseNumber === undefined ) {
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
        const updatedUser = await updateDriverService(userId, { firstName, lastName, phoneNumber, companyName, licenseNumber });

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