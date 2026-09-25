import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';

export async function getAuthenticatedUser() {
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
