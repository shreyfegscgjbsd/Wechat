import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.STORAGE_ENDPOINT;
const bucket = process.env.STORAGE_BUCKET;
const accessKey = process.env.STORAGE_ACCESS_KEY;
const secretKey = process.env.STORAGE_SECRET_KEY;

const s3Client = new S3Client({
  endpoint: endpoint || undefined,
  region: 'us-east-1',
  credentials:
    accessKey && secretKey ? { accessKeyId: accessKey, secretAccessKey: secretKey } : undefined,
  forcePathStyle: true,
});

export async function getSignedUploadUrl(
  key: string,
  mimeType: string,
): Promise<{ uploadUrl: string; headers: Record<string, string> }> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return {
    uploadUrl,
    headers: { 'Content-Type': mimeType },
  };
}

export async function getSignedDownloadUrl(key: string, expiresIn = 300): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
