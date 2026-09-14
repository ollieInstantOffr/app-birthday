import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { pushConfigured, sendPush } from '@/lib/push';

const DEFAULT_TITLE = 'Bursdagsjakten 💌';

// Sender et eget varsel fra admin til Regine.
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  if (!pushConfigured()) return NextResponse.json({ error: 'VAPID-nøkler mangler i .env' }, { status: 400 });

  const { title, body } = (await req.json().catch(() => ({}))) as { title?: string; body?: string };
  const cleanTitle = (title ?? '').trim().slice(0, 60) || DEFAULT_TITLE;
  const cleanBody = (body ?? '').trim().slice(0, 180);
  if (!cleanBody) return NextResponse.json({ error: 'Meldingen er tom' }, { status: 400 });

  const result = await sendPush({ title: cleanTitle, body: cleanBody, url: '/', tag: `custom-${Date.now()}` });
  await prisma.pushLog.create({
    data: { key: `custom-${randomUUID()}`, kind: 'custom', title: cleanTitle, body: cleanBody, devices: result.sent },
  });
  return NextResponse.json(result);
}
