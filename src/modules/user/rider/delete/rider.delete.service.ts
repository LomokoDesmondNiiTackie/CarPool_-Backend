import { prisma } from "@shared/db/prisma";
import { clerkClient } from "@clerk/express";

export class UserNotFoundError extends Error {
  constructor(clerkUserId: string) {
    super(`User with Clerk ID ${clerkUserId} not found in database`);
    this.name = 'UserNotFoundError';
  }
}

const deleteRiderService = async (clerkUserId: string) => {
    try {
        // CHECK IF USER EXIST
        const existingUser = prisma.user.findUnique({
            where: { clerkUserId }
        });

        if ( !existingUser ) {
            throw new UserNotFoundError(clerkUserId)
        };

        //DELETE FROM DATABASE AND CLERK
        try {
            // CLERK DELETE USER
            await clerkClient.users.deleteUser(clerkUserId);

            //  IF CLERK FAILS RETURN, CATCH AND LOG ERROR
        } catch( error ) {
            console.error(error)
        }

        // DELETE USER FROM DATABASE
        const user = await prisma.user.delete({
            where: { id: clerkUserId },
            include: {
                riderProfile: true,
                wallet: true
            }
        });

        if (!user) {
            throw new UserNotFoundError(clerkUserId);
        }

        return user;
    } catch (error: any) {
        // Prisma error code P2025 means "Record to delete not found"
        if (error.code === 'P2025') {
            throw new Error(`User with ID ${clerkUserId} does not exist.`);
        }
        throw error;
    }
};

export default deleteRiderService;