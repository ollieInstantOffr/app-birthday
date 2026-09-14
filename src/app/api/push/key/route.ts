import { NextResponse } from 'next/server';

// Den offentlige VAPID-nøkkelen telefonen trenger for å abonnere.
export async function GET() {
  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
}
