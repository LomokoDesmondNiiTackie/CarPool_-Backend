import { prisma } from "@shared/db/prisma";
import {removeUndefinedDeep} from "@shared/utils/removeUndefined";


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

const updateRiderService = async (userId: string, updateData: IUpdateRiderData) => {
    try {
        // CHECK IF USER EXIST
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { riderProfile: true },
        });

        if (!existingUser) {
            throw new UserNotFoundError(userId);
        };

        // REMOVE UNDEFINE IN DATA
        const userUpdateData = removeUndefinedDeep({
            firstName: updateData.firstName,
            lastName: updateData.lastName,
        });

        const riderUpdateData = removeUndefinedDeep({
            homeLat: updateData.homeLatitude,
            homeLng: updateData.homeLongitude,
            workplaceLat: updateData.workplaceLatitude,
            workplaceLng: updateData.workplaceLongitude,
            preferredBusStopId: updateData.preferredBusStopId,
        });
        
        // UPDATE USER DATA IN DATABASE USING TRANSACTION
        const updateUser = await prisma.$transaction( async( tx ) => {
            let user = existingUser;
            if (Object.keys(userUpdateData).length > 0) {
                await tx.user.update({
                    where: { id: existingUser.id },
                    data: userUpdateData,
                });
            }

            let rider;

            if (!existingUser.riderProfile) {
                rider = await tx.riderProfile.create({
                    data: {
                        userId: existingUser.id,
                        homeLat: updateData.homeLatitude ?? 0,
                        homeLng: updateData.homeLongitude ?? 0,
                        workplaceLat: updateData.workplaceLatitude ?? 0,
                        workplaceLng: updateData.workplaceLongitude ?? 0,
                        preferredBusStopId: updateData.preferredBusStopId ?? "",
                    },
                });
            } else if (Object.keys(riderUpdateData).length > 0) {
                rider = await tx.riderProfile.update({
                    where: { userId: existingUser.id },
                    data: riderUpdateData,
                });
            } else {
                rider = existingUser.riderProfile;
            }
            return { user, rider };

        });

        return updateUser;

    } catch (error: any) {
        // Prisma error code P2025 means "Record to update not found"
        if (error.code === 'P2025') {
            throw new Error(`User with ID ${userId} does not exist.`);
        }
        throw error;
    }
};

export default updateRiderService;