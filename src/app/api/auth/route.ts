import { NextResponse } from 'next/server';
import { codeMatches, setSession } from '@/lib/auth';

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  await new Promise((r) => setTimeout(r, 400)); // litt treg med vilje mot gjetting
  if (typeof code !== 'string' || !codeMatches(code, 'player')) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setSession(res, 'player');
  return res;
}
