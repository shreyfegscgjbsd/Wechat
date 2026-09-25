import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.userProfile.findMany({
      where: {
        username: { contains: query, mode: 'insensitive' },
        NOT: { id: user.id },
      },
      take: 10,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleAuthError(error);
  }
}
