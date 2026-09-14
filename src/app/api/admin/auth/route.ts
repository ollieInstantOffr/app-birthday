import { NextResponse } from 'next/server';
import { codeMatches, setSession } from '@/lib/auth';

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  await new Promise((r) => setTimeout(r, 400));
  if (typeof code !== 'string' || !codeMatches(code, 'admin')) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setSession(res, 'admin');
  return res;
}
