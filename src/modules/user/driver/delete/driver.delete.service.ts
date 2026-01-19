import { prisma } from "@shared/db/prisma";

export class UserNotFoundError extends Error {
  constructor(clerkUserId: string) {
    super(`User with Clerk ID ${clerkUserId} not found in database`);
    this.name = 'UserNotFoundError';
  }
}

const deleteDriverService = async (userId: string) => {
    try {
        // CHECK IF USER EXIST
        const existingUser = prisma.user.findUnique({
            where: { id: userId }
        });

        if ( !existingUser ) {
            throw new UserNotFoundError(userId)
        };

        // DELETE USER FROM DATABASE
        const user = await prisma.user.delete({
            where: { id: userId },
            include: {
                driverProfile: true,
                wallet: true
            }
        });

        if (!user) {
            throw new UserNotFoundError(userId);
        }

        return user;
    } catch (error: any) {
        // Prisma error code P2025 means "Record to delete not found"
        if (error.code === 'P2025') {
            throw new Error(`User with ID ${userId} does not exist.`);
        }
        throw error;
    }
};

export default deleteDriverService;