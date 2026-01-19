import { Response, Request, NextFunction } from "express";
import { bookRideService } from "./book.service";



export const bookRideController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // EXTRACT BOOKING DATA FROM REQUEST BODY
        const { riderId, session, bookingType, preferredBusStopId } = req.body;

        // CALL SERVICE TO BOOK RIDE
        const bookingResult = await bookRideService({
            riderId,
            session,
            bookingType,
            preferredBusStopId,
        });

        // For now, just send a placeholder response
        res.status(201).json({
            message: "Ride booked successfully",
            data: bookingResult, // Uncomment when service is implemented
        });
    } catch (error) {
        next(error);
    }
};