import { prisma } from "@shared/db/prisma";


interface IUpdateRiderData {
  companyName?: string;
  licenseNumber?: string;
}

export class UserNotFoundError extends Error {
  constructor(clerkUserId: string) {
    super(`User with Clerk ID ${clerkUserId} not found in database`);
    this.name = 'UserNotFoundError';
  }
}

const profileDriverService = async (userId: string, updateData: IUpdateRiderData) => {
    try {
        // CHECK IF USER EXIST
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { riderProfile: true },
        });

        if (!existingUser) {
            throw new UserNotFoundError(userId);
        };

        

        // CREATE A RIDE PROFILE
        const newRiderProfile = await prisma.driverProfile.create({
            data: {
                userId: existingUser.id,
                companyName: updateData.companyName, 
                licenseNumber: updateData.licenseNumber,
                
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

export default profileDriverService;