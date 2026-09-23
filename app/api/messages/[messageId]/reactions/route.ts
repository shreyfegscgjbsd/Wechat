import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, requireMessageAccess, handleAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reactionSchema } from "@/lib/validation";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;
    await requireMessageAccess(messageId, user.id);

    const body = await request.json();
    const { emoji } = reactionSchema.parse(body);

    const existing = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: { messageId, userId: user.id, emoji },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, added: false });
    }

    await prisma.messageReaction.create({
      data: { messageId, userId: user.id, emoji },
    });

    return NextResponse.json({ success: true, added: true }, { status: 201 });
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