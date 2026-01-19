import { prisma } from "@shared/db/prisma";


interface IUpdateRiderData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  homeLatitude?: number;
  homeLongitude?: number;
  workplaceLatitude?: number;
  workplaceLongitude?: number;
  preferredBusStopId?: string;
}

export class UserNotFoundError extends Error {
  constructor(clerkUserId: string) {
    super(`User with Clerk ID ${clerkUserId} not found in database`);
    this.name = 'UserNotFoundError';
  }
}

const profileRiderService = async (userId: string, updateData: IUpdateRiderData) => {
    try {
        // CHECK IF USER EXIST
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { riderProfile: true },
        });

        if (!existingUser) {
            throw new UserNotFoundError(userId);
        };

        // CHECK IF THERE IS RIDER !PROFILE THEN CREATE
        

        // CREATE A RIDE PROFILE
        const newRiderProfile = await prisma.riderProfile.create({
            data: {
                userId: existingUser.id,
                homeLat: updateData.homeLatitude ?? 0, 
                homeLng: updateData.homeLongitude ?? 0,
                workplaceLat: updateData.workplaceLatitude ?? 0,
                workplaceLng: updateData.workplaceLongitude ?? 0,
                preferredBusStopId: updateData.preferredBusStopId,
            } as any,
        })


        return newRiderProfile;


    } catch (error: any) {
        // Prisma error code P2025 means "Record to update not found"
        if (error.code === 'P2025') {
            throw new Error(`User with ID ${userId} does not exist.`);
        }
        throw error;
    }
};

export default profileRiderService;