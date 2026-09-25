import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';

export async function getAuthenticatedUser() {
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

export async function requireAuth(): Promise<
  NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>
> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AuthError('Unauthorized', 401);
  }
  return user;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('Unexpected auth error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export function checkConversationMembership(
  userId: string,
  conversation: { members: Array<{ userId: string }> },
): boolean {
  return conversation.members.some((m) => m.userId === userId);
}

export async function requireConversationAccess(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: { include: { user: true } } },
  });

  if (!conversation) {
    throw new AuthError('Conversation not found', 404);
  }

  if (!checkConversationMembership(userId, conversation)) {
    throw new AuthError('Access denied', 403);
  }

  return conversation;
}

export async function requireMessageAccess(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: { include: { members: true } } },
  });

  if (!message) {
    throw new AuthError('Message not found', 404);
  }

  if (!checkConversationMembership(userId, message.conversation)) {
    throw new AuthError('Access denied', 403);
  }

  return message;
}

export async function requireCallAccess(callId: string, userId: string) {
  const call = await prisma.callSession.findUnique({
    where: { id: callId },
    include: { conversation: { include: { members: true } } },
  });

  if (!call) {
    throw new AuthError('Call not found', 404);
  }

  if (!checkConversationMembership(userId, call.conversation)) {
    throw new AuthError('Access denied', 403);
  }

  return call;
}
