import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, requireConversationAccess, handleAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/lib/validation";
import { z } from "zod";

const cursorSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorSchema.parse({
      cursor: searchParams.get("cursor"),
      limit: searchParams.get("limit") ?? "50",
    });

    await requireConversationAccess(conversationId, user.id);

    const messages = await prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        reactions: { include: { user: { select: { id: true, displayName: true } } } },
        replyTo: { include: { sender: { select: { id: true, displayName: true } } } },
      },
    });

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return NextResponse.json({
      messages: page.reverse(),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return handleAuthError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    await requireConversationAccess(conversationId, user.id);

    const body = await request.json();
    const { body: messageBody, replyToMessageId } = sendMessageSchema.parse(body);

    if (replyToMessageId) {
      const replyTo = await prisma.message.findUnique({
        where: { id: replyToMessageId },
        select: { id: true, conversationId: true },
      });
      if (!replyTo || replyTo.conversationId !== conversationId) {
        return NextResponse.json(
          { error: "Reply target not found in this conversation" },
          { status: 400 }
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        type: "TEXT",
        body: messageBody,
        replyToMessageId: replyToMessageId ?? null,
      },
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        reactions: true,
        replyTo: { include: { sender: { select: { id: true, displayName: true } } } },
      },
    });

    return NextResponse.json(
      {
        ...message,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return handleAuthError(error);
  }
}