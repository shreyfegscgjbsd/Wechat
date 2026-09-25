import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { completeUploadSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mediaId, durationMs } = completeUploadSchema.parse(body);

    const asset = await prisma.mediaAsset.update({
      where: { id: mediaId, ownerId: user.id },
      data: {
        status: 'READY',
        durationMs: durationMs ?? null,
      },
    });

    return NextResponse.json({
      id: asset.id,
      status: asset.status,
      durationMs: asset.durationMs,
    });
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
