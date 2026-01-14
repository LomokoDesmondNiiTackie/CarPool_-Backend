import { prisma } from "./prisma";
import { RideSession, BookingStatus } from "../../../generated/prisma";

// TYPE DEFINITIONS
interface IAssignmentResult {
  id: string;
  busId: string;
}

interface IAssignRiderResponse {
  success: true;
  busId: string;
  assignmentId: string;
  booking: {
    id: string;
    status: BookingStatus;
  };
}

// BUSINESS ERRORS
export class AssignmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AssignmentError";
  }
}

export class AllBusesFullError extends AssignmentError {
  constructor(routeId: string, rideDate: Date, session: RideSession) {
    super(
      `All buses are full for route ${routeId} on ${rideDate.toISOString()} (${session})`,
      "ALL_BUSES_FULL_ON_ROUTE",
      409
    );
  }
}

export class BookingNotFoundError extends AssignmentError {
  constructor(bookingId: string) {
    super(`Booking ${bookingId} not found`, "BOOKING_NOT_FOUND", 404);
  }
}

// CORE ASSIGNMENT LOGIC
const AssignRiderToRoute = async (
  routeId: string,
  rideDate: Date,
  session: RideSession,
  bookingId: string
): Promise<IAssignRiderResponse> => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        // VALIDATE BOOKING EXISTS AND IS PENDING
        const existingBooking = await tx.booking.findUnique({
          where: { id: bookingId },
          select: { id: true, status: true, routeId: true },
        });

        if (!existingBooking) {
          throw new BookingNotFoundError(bookingId);
        }

        if (existingBooking.status !== BookingStatus.PENDING) {
          throw new AssignmentError(
            `Booking ${bookingId} is already ${existingBooking.status}`,
            "BOOKING_NOT_PENDING",
            400
          );
        }

        if (existingBooking.routeId !== routeId) {
          throw new AssignmentError(
            `Booking route mismatch: expected ${routeId}, got ${existingBooking.routeId}`,
            "ROUTE_MISMATCH",
            400
          );
        }

        // ATOMIC BUS ASSIGNMENT WITH ROW-LEVEL LOCKING
        const updatedAssignment = await tx.$queryRaw<IAssignmentResult[]>`
          UPDATE "bus_assignments"
          SET "bookedCount" = "bookedCount" + 1, "updatedAt" = NOW()
          WHERE "id" = (
            SELECT ba."id" 
            FROM "bus_assignments" ba
            INNER JOIN "bus" b ON ba."busId" = b."id"
            WHERE ba."rideDate" = ${rideDate}::date
              AND ba."session" = ${session}::"RideSession"
              AND ba."bookedCount" < ba."capacity"
              AND b."routeId" = ${routeId}
              AND b."status" = 'ACTIVE'
            ORDER BY ba."id" ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
          )
          RETURNING "id", "busId";
        `;

        // HANDLE OVERFLOW AND EXTRACT RESULT
        const [assignmentResult] = updatedAssignment;

        if (!assignmentResult) {
          throw new AllBusesFullError(routeId, rideDate, session);
        }

        const { id: assignmentId, busId } = assignmentResult;

        // UPDATE BOOKING WITH BUS AND CONFIRM
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            busId: busId,
            status: BookingStatus.CONFIRMED,
          },
          select: {
            id: true,
            status: true,
          },
        });

        // RETURN SUCCESS RESPONSE
        return {
          success: true,
          busId,
          assignmentId,
          booking,
        };
      },
      {
        isolationLevel: "ReadCommitted",
        timeout: 10000,
        maxWait: 5000,
      }
    );
  } catch (error) {
    // ERROR HANDLING
    if (error instanceof AssignmentError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes("Transaction timeout")) {
        throw new AssignmentError(
          "Assignment timed out due to high concurrency. Please retry.",
          "TRANSACTION_TIMEOUT",
          503
        );
      }

      if (error.message.includes("deadlock")) {
        throw new AssignmentError(
          "Deadlock detected. Please retry.",
          "DEADLOCK_DETECTED",
          503
        );
      }
    }

    console.error("Assignment Failed:", error);
    throw new AssignmentError(
      "Internal assignment error",
      "INTERNAL_ERROR",
      500
    );
  }
};

export { AssignRiderToRoute };
