import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { taskById } from '@/lib/content/public';
import { prisma } from '@/lib/db';
import { buildState, loadContext, parseTaskId, statusOf, upsertProgress } from '@/lib/progress';
import { newKey, putObject, saveLocal, storageMode } from '@/lib/storage';

const MAX_BYTES = 15 * 1024 * 1024;

function reject(status: number, code: string, detail?: unknown) {
  console.warn(`[photo] avvist ${status} ${code}`, detail ?? '');
  return NextResponse.json({ error: code, code }, { status });
}

// Telefonen sender bildet (JPEG, allerede skalert ned) hit. Serveren lagrer det i S3
// eller lokalt, og brevet er løst. Ingen direkte opplasting fra telefonen til S3.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isPlayer())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id) return reject(400, 'bad-task');
  if (taskById(id)!.kind !== 'photo') return reject(400, 'not-photo', id);

  const { progress, testMode, now } = await loadContext();
  const status = statusOf(id, progress, now, testMode);
  if (status === 'locked' || status === 'timelocked') return reject(409, status, id);

  const data = Buffer.from(await req.arrayBuffer());
  if (!data.length) return reject(400, 'empty');
  if (data.length > MAX_BYTES) return reject(413, 'size', data.length);
  if (!(data[0] === 0xff && data[1] === 0xd8)) return reject(415, 'not-jpeg', req.headers.get('content-type'));

  const key = newKey(id);
  const mode = storageMode();
  try {
    if (mode === 's3') await putObject(key, data);
    else await saveLocal(key, data);
  } catch (e) {
    console.error('[photo] lagring feilet', e);
    return reject(502, mode === 's3' ? 's3-storage' : 'local-storage');
  }

  await prisma.submission.create({ data: { taskId: id, storage: mode, key } });
  if (status !== 'solved') await upsertProgress(id, { solvedAt: now, openedAt: progress.get(id)!.openedAt ?? now });
  return NextResponse.json({ ok: true, state: await buildState() });
}
