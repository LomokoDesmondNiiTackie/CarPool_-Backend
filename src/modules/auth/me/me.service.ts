import { prisma } from '@shared/db/prisma';

export class UserNotFoundError extends Error {
  constructor(clerkUserId: string) {
    super(`User with Clerk ID ${clerkUserId} not found in database`);
    this.name = 'UserNotFoundError';
  }
}

interface IUserProfile {
  id: string;
  clerkUserId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  emailVerified: boolean;
  wallet: {
    id: string;
    balance: string;
  };
  riderProfile?: {
    id: string;
    preferredBusStopId: string;
  };
  driverProfile?: {
    id: string;
    verified: boolean;
  };
}

const getCurrentUserService = async (clerkUserId: string): Promise<IUserProfile> => {
  // FETCH USER FROM DATABASE
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      clerkUserId: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      emailVerified: true,
      wallet: {
        select: {
          id: true,
          balance: true,
        },
      },
      riderProfile: {
        select: {
          id: true,
          preferredBusStopId: true,
        },
      },
      driverProfile: {
        select: {
          id: true,
          verified: true,
        },
      },
    },
  });

  // USER NOT REGISTERED IN DATABASE
  if (!user) {
    throw new UserNotFoundError(clerkUserId);
  }

  // UPDATE LAST LOGIN TIME
  await prisma.user.update({
    where: { id: user.id },
    data: { updatedAt: new Date() }, 
  });

  // RETURN USER PROFILE
  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    fullName: user.fullName || '',
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    emailVerified: user.emailVerified,
    wallet: {
      id: user.wallet!.id,
      balance: user.wallet!.balance.toString(),
    },
    ...(user.riderProfile && { riderProfile: user.riderProfile }),
    ...(user.driverProfile && { driverProfile: user.driverProfile }),
  };
};

export default getCurrentUserService;

