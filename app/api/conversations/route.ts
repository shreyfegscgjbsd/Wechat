import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, handleAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDirectConversationSchema } from "@/lib/validation";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        members: { some: { userId: user.id } },
      },
      include: {
        members: { include: { user: true } },
        lastMessage: { include: { sender: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username } = createDirectConversationSchema.parse(body);

    const target = await prisma.userProfile.findUnique({
      where: { username },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.id === user.id) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        members: {
          every: {
            userId: { in: [user.id, target.id] },
          },
        },
      },
      include: { members: { include: { user: true } } },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: "DIRECT",
        members: {
          createMany: {
            data: [
              { userId: user.id, role: "MEMBER" },
              { userId: target.id, role: "MEMBER" },
            ],
          },
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
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