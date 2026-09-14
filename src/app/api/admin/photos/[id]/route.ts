import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { presignGet, readLocal } from '@/lib/storage';

// Ett bestemt opplastet bilde (også eldre bilder som er byttet ut).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const sub = await prisma.submission.findUnique({ where: { id } });
  if (!sub) return NextResponse.json({ error: 'not found' }, { status: 404 });

  if (sub.storage === 's3') return NextResponse.redirect(await presignGet(sub.key), 302);
  try {
    const data = await readLocal(sub.key);
    return new NextResponse(new Uint8Array(data), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=3600' },
    });
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}
