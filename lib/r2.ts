import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function getS3Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
  const endpoint =
    process.env.CLOUDFLARE_R2_ENDPOINT ??
    `https://${accountId}.r2.cloudflarestorage.com`

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  })
}

const BUCKET = () => process.env.CLOUDFLARE_R2_BUCKET_NAME!

export async function uploadAudio(
  key: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  const client = getS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  )
}

export async function getSignedAudioUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = getS3Client()
  const command = new GetObjectCommand({ Bucket: BUCKET(), Key: key })
  return getSignedUrl(client, command, { expiresIn })
}

export async function deleteAudio(key: string): Promise<void> {
  const client = getS3Client()
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET(), Key: key }))
}

export function buildR2Key(userId: string, sessionId: string, ext: string): string {
  return `recordings/${userId}/${sessionId}.${ext}`
}
