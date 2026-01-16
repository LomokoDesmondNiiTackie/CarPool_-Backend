import { prisma } from '@shared/db/prisma';
import { Prisma, UserRole } from '../../../../generated/prisma';

// TYPE DEFINITIONS
interface IRegistrationData {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

interface IRegistrationResponse {
  success: true;
  user: {
    id: string;
    clerkUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  wallet: {
    id: string;
    balance: number;
  };
  message: string;
}

// CUSTOM ERRORS
export class RegistrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'RegistrationError';
  }
}

// REGISTRATION SERVICE
const registrationService = async ({ clerkUserId, firstName, lastName, email, role }: IRegistrationData): Promise<IRegistrationResponse> => {
  try {
    // CHECK IF USER ALREADY EXISTS
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { wallet: true },
    });

    if (existingUser) {
      // User already registered - return existing data
      return {
        success: true,
        user: {
          id: existingUser.id,
          clerkUserId: existingUser.clerkUserId,
          firstName: existingUser.firstName || '',
          lastName: existingUser.lastName || '',
          email: existingUser.email,
          role: existingUser.role,
        },
        wallet: {
          id: existingUser.wallet!.id,
          balance: Number(existingUser.wallet!.balance),
        },
        message: 'User already registered',
      };
    }

    // CREATE USER AND WALLET IN TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          clerkUserId,
          firstName,
          lastName,
          email,
          role,
          emailVerified: true,
        },
      });

      // Create wallet for user
      const newWallet = await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0.0,
        },
      });

      return { user: newUser, wallet: newWallet };
    });

    // RETURN SUCCESS RESPONSE
    return {
      success: true,
      user: {
        id: result.user.id,
        clerkUserId: result.user.clerkUserId,
        firstName: result.user.firstName || '',
        lastName: result.user.lastName || '',
        email: result.user.email,
        role: result.user.role,
      },
      wallet: {
        id: result.wallet.id,
        balance: Number(result.wallet.balance),
      },
      message: 'Registration successful',
    };
  } catch (error) {
    // HANDLE PRISMA ERRORS
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.['target'] as string[]) || [];
        if (target.includes('email')) {
          throw new RegistrationError(
            'Email already registered',
            'EMAIL_EXISTS',
            409
          );
        }
        if (target.includes('clerkUserId')) {
          throw new RegistrationError(
            'User already registered',
            'USER_EXISTS',
            409
          );
        }
      }
    }

    // Unknown error
    console.error('Registration failed:', error);
    throw new RegistrationError(
      'Registration failed. Please try again.',
      'REGISTRATION_FAILED',
      500
    );
  }
};

export default registrationService;
