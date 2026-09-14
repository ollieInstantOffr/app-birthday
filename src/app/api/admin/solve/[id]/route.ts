import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { parseTaskId, upsertProgress } from '@/lib/progress';

// Markerer et brev som løst, f.eks. hvis en bildeopplasting står fast.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await upsertProgress(id, { solvedAt: new Date() });
  return NextResponse.json({ ok: true });
}
