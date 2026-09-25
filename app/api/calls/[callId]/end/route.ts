import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, requireCallAccess, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ callId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId } = await params;
    const call = await requireCallAccess(callId, user.id);

    const now = new Date();
    const durationMs = call.startedAt ? now.getTime() - call.startedAt.getTime() : 0;

    const updated = await prisma.callSession.update({
      where: { id: callId },
      data: {
        status: 'ENDED',
        endedAt: now,
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      endedAt: updated.endedAt?.toISOString() ?? null,
      durationMs,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
