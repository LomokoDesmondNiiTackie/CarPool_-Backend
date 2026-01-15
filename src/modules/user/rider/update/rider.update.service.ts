import { prisma } from "@shared/db/prisma";

export class UserNotFoundError extends Error {
  constructor(clerkUserId: string) {
    super(`User with Clerk ID ${clerkUserId} not found in database`);
    this.name = 'UserNotFoundError';
  }
}

const updateRiderService = async (clerkUserId: string, updateData: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string; homeLatitude?: number; homeLongitude?: number; workplaceLatitude?: number; workplaceLongitude?: number; preferredBusStopId?: string }) => {
    try {
        // UPDATE USER INFORMATION IN DATABASE
        const user = await prisma.user.update({
            where: { id: clerkUserId },
            data: {
                firstName: updateData.firstName || "",
                lastName: updateData.lastName || "",
                email: updateData.email || "",
                phoneNumber: updateData.phoneNumber || "",
                // UPDATE RIDER PROFILE IF NEEDED
                riderProfile: {
                    update: {
                        homeLat: updateData.homeLatitude || 0,
                        homeLng: updateData.homeLongitude || 0,
                        workplaceLat: updateData.workplaceLatitude || 0,
                        workplaceLng: updateData.workplaceLongitude || 0,
                        preferredBusStopId: updateData.preferredBusStopId || "",
                    }
                }
            },
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
        // Prisma error code P2025 means "Record to update not found"
        if (error.code === 'P2025') {
            throw new Error(`User with ID ${clerkUserId} does not exist.`);
        }
        throw error;
    }
};

export default updateRiderService;