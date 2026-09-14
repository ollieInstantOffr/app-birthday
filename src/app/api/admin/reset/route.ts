import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { deleteStored } from '@/lib/storage';

// Nullstiller all fremdrift. Testmodus beholdes som den er.
// { deleteImages: true } sletter også de opplastede bildene fra lagringen.
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { deleteImages } = (await req.json().catch(() => ({}))) as { deleteImages?: boolean };

  if (deleteImages) {
    const submissions = await prisma.submission.findMany();
    await Promise.all(submissions.map((s) => deleteStored(s.storage, s.key)));
  }

  await prisma.$transaction([
    prisma.progress.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.attemptLog.deleteMany(),
    // Varselloggen tømmes, så automatiske varsler kan sendes på nytt. Enhetene hun har slått på varsler for beholdes.
    prisma.pushLog.deleteMany(),
    prisma.appState.updateMany({ data: { welcomedAt: null, giftOpenedAt: null } }),
  ]);
  return NextResponse.json({ ok: true });
}
