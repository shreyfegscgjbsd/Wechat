import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function getAuthUser() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    return null;
  }

  if (!userId) return null;

  let existing: {
    id: string;
    clerkUserId: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null = null;
  try {
    existing = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
    });
  } catch {
    // DB error — return a minimal user object to avoid redirect loops
    // The user is authenticated via Clerk, just return minimal data
    return {
      id: userId,
      clerkUserId: userId,
      username: 'user',
      displayName: 'User',
      avatarUrl: null,
      bio: null,
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  if (existing) return existing;

  let clerkUser: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>['users']['getUser']>>;
  try {
    const client = await clerkClient();
    clerkUser = await client.users.getUser(userId);
  } catch {
    return {
      id: userId,
      clerkUserId: userId,
      username: 'user',
      displayName: 'User',
      avatarUrl: null,
      bio: null,
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const username =
    clerkUser.username ??
    clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] ??
    `user_${userId.slice(-8)}`;
  const displayName =
    clerkUser.fullName ??
    clerkUser.firstName ??
    clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] ??
    'User';

  try {
    return await prisma.userProfile.create({
      data: {
        clerkUserId: userId,
        username: username || `user_${userId.slice(-8)}`,
        displayName,
        avatarUrl: clerkUser.imageUrl ?? null,
        bio: (clerkUser as { bio?: string | null }).bio ?? null,
      },
    });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      try {
        return await prisma.userProfile.findUniqueOrThrow({
          where: { clerkUserId: userId },
        });
      } catch {
        // Return minimal user to avoid redirect loops
        return {
          id: userId,
          clerkUserId: userId,
          username: username || `user_${userId.slice(-8)}`,
          displayName,
          avatarUrl: clerkUser.imageUrl ?? null,
          bio: null,
          lastSeenAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }
    // DB error — return minimal user to avoid redirect loops
    return {
      id: userId,
      clerkUserId: userId,
      username: username || `user_${userId.slice(-8)}`,
      displayName,
      avatarUrl: clerkUser.imageUrl ?? null,
      bio: null,
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
