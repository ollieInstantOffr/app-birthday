import type { PrismaPromise } from '@prisma/client';
import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { deleteStored } from '@/lib/storage';

// Nullstiller all fremdrift. Testmodus beholdes som den er.
// { deleteImages: true }  sletter også de opplastede bildene fra lagringen.
// { logoutDevices: true } logger ut alle Regines enheter og fjerner varsel-enhetene.
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { deleteImages, logoutDevices } = (await req.json().catch(() => ({}))) as {
    deleteImages?: boolean;
    logoutDevices?: boolean;
  };

  if (deleteImages) {
    const submissions = await prisma.submission.findMany();
    await Promise.all(submissions.map((s) => deleteStored(s.storage, s.key)));
  }

  const ops: PrismaPromise<unknown>[] = [
    prisma.progress.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.attemptLog.deleteMany(),
    // Varselloggen tømmes, så automatiske varsler kan sendes på nytt.
    prisma.pushLog.deleteMany(),
    prisma.appState.upsert({
      where: { id: 1 },
      create: { id: 1, sessionVersion: logoutDevices ? 2 : 1 },
      update: { welcomedAt: null, giftOpenedAt: null, ...(logoutDevices ? { sessionVersion: { increment: 1 } } : {}) },
    }),
  ];
  if (logoutDevices) ops.push(prisma.pushDevice.deleteMany());
  await prisma.$transaction(ops);

  return NextResponse.json({ ok: true });
}
