import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, requireMessageAccess, handleAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { editMessageSchema } from "@/lib/validation";
import { z } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;
    const message = await requireMessageAccess(messageId, user.id);

    if (message.senderId !== user.id) {
      return NextResponse.json(
        { error: "Can only edit your own messages" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { body: newBody } = editMessageSchema.parse(body);

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { body: newBody, editedAt: new Date() },
      include: { sender: true, reactions: { include: { user: true } } },
    });

    return NextResponse.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      editedAt: updated.editedAt?.toISOString() ?? null,
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;
    const message = await requireMessageAccess(messageId, user.id);

    if (message.senderId !== user.id) {
      return NextResponse.json(
        { error: "Can only delete your own messages" },
        { status: 403 }
      );
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), body: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}