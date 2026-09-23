import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, requireConversationAccess, handleAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markReadSchema } from "@/lib/validation";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const conversation = await requireConversationAccess(conversationId, user.id);

    return NextResponse.json({
      ...conversation,
      members: conversation.members.map((m: { conversationId: string; userId: string; role: string; joinedAt: Date; lastReadMessageId: string | null; user?: { id: string } }) => ({
        conversationId: m.conversationId,
        userId: m.userId,
        role: m.role,
        lastReadMessageId: m.lastReadMessageId,
      })),
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(
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
    const { lastReadMessageId } = markReadSchema.parse(body);

    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
      data: { lastReadMessageId },
    });

    return NextResponse.json({ success: true });
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