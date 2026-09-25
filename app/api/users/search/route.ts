import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/ratelimit';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 30 searches per minute per user
    const { allowed, remaining } = rateLimit(`search:${user.id}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Sanitize: strip HTML tags and limit length
    const sanitizedQuery = query.replace(/<[^>]*>/g, '').slice(0, 50);

    const users = await prisma.userProfile.findMany({
      where: {
        username: { contains: sanitizedQuery, mode: 'insensitive' },
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

    return NextResponse.json(
      { users },
      {
        headers: { 'X-RateLimit-Remaining': String(remaining) },
      },
    );
  } catch (error) {
    return handleAuthError(error);
  }
}
