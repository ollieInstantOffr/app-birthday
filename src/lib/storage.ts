import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { rm } from 'node:fs/promises';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type StorageMode = 's3' | 'local';

export const storageMode = (): StorageMode => (process.env.S3_BUCKET ? 's3' : 'local');

let client: S3Client | null = null;
function s3(): S3Client {
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || 'eu-north-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
          : undefined,
    });
  }
  return client;
}

export function newKey(taskId: number): string {
  return `birthday/2026/task-${taskId}/${randomUUID()}.jpg`;
}

const KEY_RE = /^birthday\/2026\/task-(\d{1,2})\/[0-9a-f-]{36}\.jpg$/;

export function keyTask(key: string): number | null {
  const m = key.match(KEY_RE);
  return m ? Number(m[1]) : null;
}

/** Serveren laster opp bildet til S3 (telefonen snakker aldri direkte med bøtta). */
export async function putObject(key: string, data: Buffer): Promise<void> {
  await s3().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: data, ContentType: 'image/jpeg' }));
}

export async function presignGet(key: string): Promise<string> {
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }), { expiresIn: 3600 });
}

function localPath(key: string): string {
  if (!KEY_RE.test(key)) throw new Error('ugyldig nøkkel');
  return path.join(path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || './uploads'), key);
}

export async function saveLocal(key: string, data: Buffer): Promise<void> {
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

export async function readLocal(key: string): Promise<Buffer> {
  return readFile(localPath(key));
}

/** Sletter et opplastet bilde. Feil (f.eks. allerede slettet) ignoreres. */
export async function deleteStored(storage: string, key: string): Promise<void> {
  try {
    if (storage === 's3') await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    else await rm(localPath(key), { force: true });
  } catch (e) {
    console.error('Kunne ikke slette bilde', key, e);
  }
}
