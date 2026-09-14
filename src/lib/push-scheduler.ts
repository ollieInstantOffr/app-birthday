import 'server-only';
import { TASKS } from './content/public';
import { prisma } from './db';
import { getTestMode, loadProgress, statusOf } from './progress';
import { pushConfigured, sendPush } from './push';
import { atEventTime, eventDate } from './time';

/** Varsler sendes bare hvis serveren var oppe innen to timer etter tidslåsen. */
const WINDOW_MS = 2 * 3600 * 1000;

const MESSAGES: Record<number, { title: string; body: string }> = {
  1: { title: 'God morgen, Regine 💌', body: 'Gratulerer med dagen! Det første brevet henger på snoren.' },
  5: { title: 'Et nytt brev har kommet 💌', body: 'Brev 5 henger på snoren nå.' },
  10: { title: 'Det siste brevet er her ✨', body: 'Brev 10 venter på snoren.' },
};

const BEHIND = { title: 'Du har brev som venter 💌', body: 'Snoren din har fått et nytt brev. Fortsett der du slapp.' };

/** Sender varsel til Regine når et tidslåst brev åpner (07:00, 13:15, 18:15). Ikke i testmodus. */
export async function checkScheduledPushes(now = new Date()) {
  if (!pushConfigured() || (await getTestMode())) return;
  const progress = await loadProgress();

  for (const task of TASKS) {
    if (!task.unlockTime) continue;
    const since = now.getTime() - atEventTime(task.unlockTime).getTime();
    if (since < 0 || since > WINDOW_MS) continue;

    const key = `unlock-${task.id}-${eventDate()}`;
    const status = statusOf(task.id, progress, now);
    const message = status === 'solved' ? null : status === 'available' ? MESSAGES[task.id] : BEHIND;

    try {
      await prisma.pushLog.create({ data: { key, kind: 'scheduled', title: message?.title, body: message?.body } });
    } catch {
      continue; // allerede sendt
    }
    if (!message) continue;

    const result = await sendPush({ ...message, url: '/', tag: key });
    await prisma.pushLog.update({ where: { key }, data: { devices: result.sent } });
    console.log(`[push] ${key}: ${result.sent} sendt, ${result.failed} feilet`);
  }
}

export function startPushScheduler() {
  const g = globalThis as unknown as { __pushScheduler?: ReturnType<typeof setInterval> };
  if (g.__pushScheduler) return;
  const tick = () => checkScheduledPushes().catch((e) => console.error('[push] planleggeren feilet', e));
  g.__pushScheduler = setInterval(tick, 30_000);
  setTimeout(tick, 5_000);
}
