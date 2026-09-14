import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { buildState } from '@/lib/progress';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isPlayer())) return unauthorized();
  return NextResponse.json(await buildState());
}
