import 'server-only';
import webpush from 'web-push';
import { prisma } from './db';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

let configured: boolean | null = null;

export function pushConfigured(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return (configured = false);
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:bursdagsjakten@example.com', publicKey, privateKey);
  return (configured = true);
}

interface IncomingSubscription {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
}

export async function saveDevice(sub: IncomingSubscription, userAgent: string | null) {
  const { endpoint, keys } = sub;
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || typeof keys?.p256dh !== 'string' || typeof keys?.auth !== 'string') {
    return false;
  }
  const data = { p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent?.slice(0, 300) ?? null, lastError: null };
  await prisma.pushDevice.upsert({ where: { endpoint }, create: { endpoint, ...data }, update: data });
  return true;
}

/** Sender et varsel til alle Regines enheter. */
export async function sendPush(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!pushConfigured()) return { sent: 0, failed: 0 };
  const devices = await prisma.pushDevice.findMany();
  let sent = 0;
  let failed = 0;
  await Promise.all(
    devices.map(async (d) => {
      try {
        await webpush.sendNotification(
          { endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } },
          JSON.stringify(payload),
          { TTL: 6 * 3600, urgency: 'high' },
        );
        sent++;
        await prisma.pushDevice.update({ where: { id: d.id }, data: { lastSuccessAt: new Date(), lastError: null } });
      } catch (e) {
        failed++;
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // Abonnementet finnes ikke lenger (appen slettet, varsler skrudd av).
          await prisma.pushDevice.delete({ where: { id: d.id } }).catch(() => {});
        } else {
          const message = `${status ?? ''} ${(e as Error).message}`.trim().slice(0, 300);
          await prisma.pushDevice.update({ where: { id: d.id }, data: { lastError: message } }).catch(() => {});
        }
      }
    }),
  );
  return { sent, failed };
}
