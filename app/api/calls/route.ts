import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, requireConversationAccess, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startCallSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, type } = startCallSchema.parse(body);

    const conversation = await requireConversationAccess(conversationId, user.id);

    const otherMember = conversation.members.find((m: { userId: string }) => m.userId !== user.id);
    if (!otherMember) {
      return NextResponse.json({ error: 'No other member in conversation' }, { status: 400 });
    }

    const call = await prisma.callSession.create({
      data: {
        conversationId,
        initiatedById: user.id,
        type,
        status: 'RINGING',
      },
      include: {
        conversation: { include: { members: { include: { user: true } } } },
      },
    });

    return NextResponse.json(
      {
        ...call,
        createdAt: call.createdAt.toISOString(),
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

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calls = await prisma.callSession.findMany({
      where: {
        conversation: {
          members: { some: { userId: user.id } },
        },
      },
      include: {
        conversation: { include: { members: { include: { user: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      calls.map(
        (c: {
          id: string;
          status: string;
          createdAt: Date;
          startedAt: Date | null;
          endedAt: Date | null;
        }) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          startedAt: c.startedAt?.toISOString() ?? null,
          endedAt: c.endedAt?.toISOString() ?? null,
        }),
      ),
    );
  } catch (error) {
    return handleAuthError(error);
  }
}
