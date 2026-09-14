import { NextResponse } from 'next/server';
import { isAdmin, isPlayer, unauthorized } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseTaskId } from '@/lib/progress';
import { presignGet, readLocal } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isPlayer()) && !(await isAdmin())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const sub = await prisma.submission.findFirst({ where: { taskId: id }, orderBy: { id: 'desc' } });
  if (!sub) return NextResponse.json({ error: 'not found' }, { status: 404 });

  if (sub.storage === 's3') {
    return NextResponse.redirect(await presignGet(sub.key), 302);
  }
  try {
    const data = await readLocal(sub.key);
    return new NextResponse(new Uint8Array(data), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=3600' },
    });
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}
