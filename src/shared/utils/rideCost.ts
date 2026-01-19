import { BookingType } from "../../../generated/prisma";

const calculateRideCost = (bookingType: BookingType): number => {
  const DAILY_RIDE_COST = 5.0; // GHS 5.00
  const WEEKLY_RIDE_COST = 30.0; // GHS 30.00 (5 days)

  return bookingType === BookingType.DAILY ? DAILY_RIDE_COST : WEEKLY_RIDE_COST;
};


export { calculateRideCost };