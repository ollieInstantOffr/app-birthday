import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseTaskId } from '@/lib/progress';
import { deleteStored } from '@/lib/storage';

// Nullstiller ett brev: fremdrift, forsøk og bilder for akkurat det brevet.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const submissions = await prisma.submission.findMany({ where: { taskId: id } });
  await Promise.all(submissions.map((s) => deleteStored(s.storage, s.key)));
  await prisma.$transaction([
    prisma.progress.deleteMany({ where: { taskId: id } }),
    prisma.submission.deleteMany({ where: { taskId: id } }),
    prisma.attemptLog.deleteMany({ where: { taskId: id } }),
  ]);
  return NextResponse.json({ ok: true });
}
