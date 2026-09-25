import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  if (existing) return existing;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
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
      return prisma.userProfile.findUniqueOrThrow({
        where: { clerkUserId: userId },
      });
    }
    throw e;
  }
}
