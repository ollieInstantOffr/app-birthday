import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { parseTaskId, upsertProgress } from '@/lib/progress';

// Åpner et tidslåst brev uten å vente på klokka. Rekkefølgen gjelder fortsatt:
// brevet åpner først når alle brevene før er forseglet.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await upsertProgress(id, { manualUnlock: true });
  return NextResponse.json({ ok: true });
}
