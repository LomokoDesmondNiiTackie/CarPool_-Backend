import { prisma } from "@shared/db/prisma";
import { BookingStatus, RideSession, BookingType } from "../../../../generated/prisma";
import { calculateRideCost } from "@shared/utils/rideCost";
import { findRouteForBusStop } from "@shared/utils/findRoute";
import { generateQRToken } from "@shared/utils/qrCode";

interface IBookRideData {
    riderId: string,
    session: RideSession,
    bookingType: BookingType,
    preferredBusStopId: string,
}

export class BookingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

export class UserNotFoundError extends BookingError {
  constructor(userId: string) {
    super(`User ${userId} not found`, 'USER_NOT_FOUND', 404);
  }
}

export class ProfileIncompleteError extends BookingError {
  constructor() {
    super(
      'Please complete your rider profile before booking',
      'PROFILE_INCOMPLETE',
      400
    );
  }
}

export class InsufficientFundsError extends BookingError {
  constructor(required: number, available: number) {
    super(
      `Insufficient funds. Required: GHS ${required}, Available: GHS ${available}`,
      'INSUFFICIENT_FUNDS',
      400
    );
  }
}


const bookRideService = async ({ riderId, session, bookingType, preferredBusStopId }: IBookRideData) => {
    try {
        // VALIDATE USER
        const user = await prisma.user.findUnique({
            where: { id: riderId },
            include: {
                riderProfile: true,
                wallet: true,
            },
        });

        if (!user) {
            throw new UserNotFoundError(riderId);
        }

        if (!user.riderProfile) {
            throw new ProfileIncompleteError();
        }

        if (!user.wallet) {
            throw new BookingError('Wallet not found. Please contact support.', 'WALLET_NOT_FOUND', 500);
        }
        
        // USE PREFERRED BUS STOP FROM REQUEST OR USER PROFILE
        const busStopId = preferredBusStopId || user.riderProfile.preferredBusStopId;

        // CALCULATE RIDE COST
        const rideCost = calculateRideCost(bookingType);
        const currentBalance = Number(user.wallet.balance);

        if (currentBalance < rideCost) {
            throw new InsufficientFundsError(rideCost, currentBalance);
        }


        // FIND ROUTE FOR BUS STOP
        const routeId = await findRouteForBusStop(busStopId);

        // CREATE BOOKING IN TRANSACTION
        const result = await prisma.$transaction(
            async (tx) => {
                // FIND BUS AND ASSIGN TO BOOKING
                const busAssigned = await tx.bus.findFirst({
                    where: {
                        routeId,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                    select: { id: true, plateNumber: true },
                });
                
                if (!busAssigned) {
                    throw new BookingError('No bus available for the selected route and session', 'NO_BUS_AVAILABLE', 503);
                }
                // Create pending booking
                const booking = await tx.booking.create({
                    data: {
                        riderId,
                        routeId,
                        busId: busAssigned.id,
                        session,
                        rideDate: new Date(),
                        bookingType,
                        status: BookingStatus.PENDING,
                    },
                });

                // Deduct payment from wallet
                await tx.wallet.update({
                    where: { userId: riderId },
                    data: {
                        balance: {
                            decrement: rideCost,
                        },
                    },
                });

                // Record transaction
                const transaction = await tx.transaction.create({
                    data: {
                    userId: riderId,
                    bookingId: booking.id,
                    amount: rideCost,
                    status: 'SUCCESS',
                    provider: 'WALLET',
                    },
                });

                // GENERATE QR CODE
                const qrToken = await generateQRToken(booking.id);

                await tx.booking.update({
                    where: { id: booking.id },
                    data: { qrToken: qrToken.qrImage, rawToken: qrToken.token },
                });

                return {
                    booking,
                    busAssigned,
                    transaction,
                    qrToken: qrToken.qrImage,
                };
            },
            {
                isolationLevel: 'ReadCommitted',
                timeout: 15000, // 15 seconds
                maxWait: 5000,
            }
        );

        return {
            bookingId: result.booking.id,
            status: BookingStatus.CONFIRMED,
            routeId,
            bus: result.busAssigned,
            session,
            qrToken: result.qrToken,
            message: 'Booking confirmed',
        };

    } catch (error: any) {
        throw error;
    }
};

export { bookRideService };