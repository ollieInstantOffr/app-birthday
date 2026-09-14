'use client';

import { useCallback, useEffect, useState } from 'react';

/** unsupported: nettleseren kan ikke (f.eks. iPhone i Safari — appen må ligge på hjemskjermen). */
export type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied' | 'error';

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function keyToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function syncSubscription() {
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  const { publicKey } = (await fetch('/api/push/key').then((r) => r.json())) as { publicKey: string | null };
  if (!publicKey) throw new Error('VAPID-nøkkel mangler på serveren');
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey) }));
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/**
 * Push-varsler til Regine på denne enheten. Er tillatelsen allerede gitt, synkes
 * abonnementet stille ved oppstart. `enable` må kalles rett fra et trykk (iOS krever det).
 */
export function usePush(active: boolean) {
  const [status, setStatus] = useState<PushStatus>('unsupported');

  useEffect(() => {
    if (!active || !pushSupported()) return;
    const permission = Notification.permission as PushStatus;
    setStatus(permission);
    navigator.serviceWorker.register('/sw.js').catch(() => {});
    if (permission === 'granted') syncSubscription().catch((e) => console.warn('[push]', e));
  }, [active]);

  const enable = useCallback(async (): Promise<PushStatus> => {
    if (!pushSupported()) return 'unsupported';
    const permission = (await Notification.requestPermission()) as PushStatus;
    setStatus(permission);
    if (permission !== 'granted') return permission;
    try {
      await syncSubscription();
      return 'granted';
    } catch (e) {
      console.error('[push]', e);
      setStatus('error');
      return 'error';
    }
  }, []);

  return { status, enable };
}
