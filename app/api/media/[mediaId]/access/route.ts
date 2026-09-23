import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, handleAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mediaId } = await params;

    const asset = await prisma.mediaAsset.findUnique({
      where: { id: mediaId },
    });

    if (!asset) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (asset.ownerId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const downloadUrl = await getSignedDownloadUrl(asset.storageKey);

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    return handleAuthError(error);
  }
}