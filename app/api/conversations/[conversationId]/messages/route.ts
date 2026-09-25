import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, requireConversationAccess, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMessageSchema } from '@/lib/validation';
import { z } from 'zod';
import { rateLimit } from '@/lib/ratelimit';

const cursorSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorSchema.parse({
      cursor: searchParams.get('cursor'),
      limit: searchParams.get('limit') ?? '50',
    });

    await requireConversationAccess(conversationId, user.id);

    const messages = await prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        reactions: {
          include: { user: { select: { id: true, displayName: true } } },
        },
        replyTo: { include: { sender: { select: { id: true, displayName: true } } } },
      },
    });

    // Aggregate reaction counts per emoji
    const reactionCounts = await prisma.messageReaction.groupBy({
      by: ['messageId', 'emoji'],
      _count: { _all: true },
      where: { messageId: { in: messages.map((m) => m.id) } },
    });
    const countMap = new Map<string, number>();
    for (const r of reactionCounts) {
      countMap.set(`${r.messageId}:${r.emoji}`, r._count._all);
    }

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return NextResponse.json({
      messages: page.map((m) => ({
        ...m,
        reactions: m.reactions.map((r) => ({
          ...r,
          count: countMap.get(`${m.id}:${r.emoji}`) ?? 1,
        })),
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 },
      );
    }
    return handleAuthError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit messages: 20 per minute per user
    const { allowed } = rateLimit(`msg:${user.id}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many messages. Please slow down.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const { conversationId } = await params;
    await requireConversationAccess(conversationId, user.id);

    const body = await request.json();
    const { body: messageBody, replyToMessageId, type, mediaId } = sendMessageSchema.parse(body);

    // Validate: TEXT messages must have a body, VOICE messages must have a mediaId
    if (type === 'TEXT' && (!messageBody || messageBody.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Message body is required for text messages' },
        { status: 400 },
      );
    }
    if (type === 'VOICE' && !mediaId) {
      return NextResponse.json(
        { error: 'mediaId is required for voice messages' },
        { status: 400 },
      );
    }

    if (replyToMessageId) {
      const replyTo = await prisma.message.findUnique({
        where: { id: replyToMessageId },
        select: { id: true, conversationId: true },
      });
      if (!replyTo || replyTo.conversationId !== conversationId) {
        return NextResponse.json(
          { error: 'Reply target not found in this conversation' },
          { status: 400 },
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        type,
        body: type === 'TEXT' ? (messageBody ?? null) : null,
        replyToMessageId: replyToMessageId ?? null,
        ...(type === 'VOICE' && mediaId ? { voice: { create: { mediaAssetId: mediaId } } } : {}),
      },
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        reactions: true,
        replyTo: { include: { sender: { select: { id: true, displayName: true } } } },
        voice: { include: { mediaAsset: true } },
      },
    });

    return NextResponse.json(
      {
        ...message,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 },
      );
    }
    return handleAuthError(error);
  }
}
