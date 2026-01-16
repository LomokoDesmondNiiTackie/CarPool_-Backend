import { prisma } from "@shared/db/prisma";
import { clerkClient } from "@clerk/express";
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

const updateRiderService = async (clerkUserId: string, updateData: IUpdateRiderData) => {
    try {
        // CHECK IF USER EXIST
        const existingUser = await prisma.user.findUnique({
            where: { clerkUserId },
            include: { riderProfile: true },
        });

        if (!existingUser) {
            throw new UserNotFoundError(clerkUserId);
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
        
        // UPDATE CLERK USER ( NAME ONLY )
        if (updateData.firstName || updateData.lastName) {
            try {
                const clerkUpdateData = removeUndefinedDeep({
                    firstName: updateData.firstName,
                    lastName: updateData.lastName,
                });

                await clerkClient.users.updateUser(clerkUserId, clerkUpdateData);
            } catch (error) {
                console.error('Failed to update Clerk user:', error);
            }
        }

        // UPDATE USER DATA IN DATABASE USING TRANSACTION
        const updateUser = await prisma.$transaction( async( tx ) => {
            let user = existingUser;
            if (Object.keys(userUpdateData).length > 0) {
                await tx.user.update({
                    where: { clerkUserId },
                    data: userUpdateData,
                });
            }

             let rider = existingUser.riderProfile;

            if (Object.keys(riderUpdateData).length > 0) {
                rider = await tx.riderProfile.update({
                    where: { userId: user.id },
                    data: riderUpdateData,
                });
            } else {
                // CREATE A RIDE PROFILE
                rider = await tx.riderProfile.create({
                    data: {
                        userId: existingUser.id,
                        homeLat: updateData.homeLatitude ?? 0, 
                        homeLng: updateData.homeLongitude ?? 0,
                        workplaceLat: updateData.workplaceLatitude ?? 0,
                        workplaceLng: updateData.workplaceLongitude ?? 0,
                        preferredBusStopId: updateData.preferredBusStopId,
                    } as any,
                })
            }

            return { user, rider };

        });

        return updateUser;


    } catch (error: any) {
        // Prisma error code P2025 means "Record to update not found"
        if (error.code === 'P2025') {
            throw new Error(`User with ID ${clerkUserId} does not exist.`);
        }
        throw error;
    }
};

export default updateRiderService;