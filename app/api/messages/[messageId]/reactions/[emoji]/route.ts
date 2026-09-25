import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, requireMessageAccess, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string; emoji: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, emoji } = await params;
    await requireMessageAccess(messageId, user.id);

    await prisma.messageReaction.delete({
      where: {
        messageId_userId_emoji: { messageId, userId: user.id, emoji },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
