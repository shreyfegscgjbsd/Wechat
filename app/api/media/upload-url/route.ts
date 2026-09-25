import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadUrlSchema, ALLOWED_AUDIO_MIME_TYPES, MAX_UPLOAD_SIZE } from '@/lib/validation';
import { z } from 'zod';
import { getSignedUploadUrl } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mimeType, sizeBytes } = uploadUrlSchema.parse(body);

    if (!ALLOWED_AUDIO_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported audio type. Allowed: ${ALLOWED_AUDIO_MIME_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    if (sizeBytes > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        ownerId: user.id,
        storageKey: `voice/${user.id}/${crypto.randomUUID()}`,
        mimeType,
        sizeBytes,
        status: 'PENDING',
      },
    });

    const { uploadUrl, headers } = await getSignedUploadUrl(mediaAsset.storageKey, mimeType);

    return NextResponse.json({
      uploadUrl,
      mediaId: mediaAsset.id,
      storageKey: mediaAsset.storageKey,
      headers,
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
