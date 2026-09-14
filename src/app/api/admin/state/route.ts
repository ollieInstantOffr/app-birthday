import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { TASKS, taskById } from '@/lib/content/public';
import { prisma } from '@/lib/db';
import { buildState, loadProgress } from '@/lib/progress';
import { pushConfigured } from '@/lib/push';
import { storageMode } from '@/lib/storage';

function deviceName(userAgent: string | null): string {
  if (!userAgent) return 'Ukjent enhet';
  if (/iPhone/.test(userAgent)) return 'iPhone';
  if (/iPad/.test(userAgent)) return 'iPad';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Macintosh/.test(userAgent)) return 'Mac';
  if (/Windows/.test(userAgent)) return 'Windows';
  return 'Nettleser';
}

export const dynamic = 'force-dynamic';

type ActivityKind = 'welcome' | 'open' | 'attempt' | 'hint' | 'photo' | 'solved' | 'gift';

interface Activity {
  at: string;
  kind: ActivityKind;
  taskId: number | null;
  text: string;
  ok?: boolean;
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const [state, progress, attempts, submissions, app, devices, pushLogs] = await Promise.all([
    buildState(),
    loadProgress(),
    prisma.attemptLog.findMany({ orderBy: { id: 'desc' }, take: 500 }),
    prisma.submission.findMany({ orderBy: { id: 'desc' } }),
    prisma.appState.findUnique({ where: { id: 1 } }),
    prisma.pushDevice.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.pushLog.findMany({ where: { title: { not: null } }, orderBy: { sentAt: 'desc' }, take: 30 }),
  ]);

  const latestByTask = new Map<number, number>();
  for (const s of submissions) if (!latestByTask.has(s.taskId)) latestByTask.set(s.taskId, s.id);

  const tasks = TASKS.map((t) => {
    const view = state.tasks.find((v) => v.id === t.id)!;
    const row = progress.get(t.id)!;
    const latest = latestByTask.get(t.id);
    return {
      id: t.id,
      title: t.title,
      kind: t.kind,
      unlockTime: t.unlockTime ?? null,
      status: view.status,
      manualUnlock: row.manualUnlock,
      openedAt: row.openedAt,
      solvedAt: row.solvedAt,
      attemptCount: row.attemptCount,
      hint1At: row.hint1At,
      hint2At: row.hint2At,
      photoCount: submissions.filter((s) => s.taskId === t.id).length,
      photoUrl: latest ? `/api/admin/photos/${latest}` : null,
      attempts: attempts.filter((a) => a.taskId === t.id).slice(0, 20),
    };
  });

  const photos = submissions.map((s) => ({
    id: s.id,
    taskId: s.taskId,
    title: taskById(s.taskId)?.title ?? '',
    caption: taskById(s.taskId)?.caption ?? '',
    createdAt: s.createdAt,
    url: `/api/admin/photos/${s.id}`,
    latest: latestByTask.get(s.taskId) === s.id,
  }));

  const activity: Activity[] = [];
  const iso = (d: Date) => d.toISOString();
  if (app?.welcomedAt) activity.push({ at: iso(app.welcomedAt), kind: 'welcome', taskId: null, text: 'Åpnet appen og hengte opp snoren' });
  if (app?.giftOpenedAt) activity.push({ at: iso(app.giftOpenedAt), kind: 'gift', taskId: null, text: 'Åpnet gaven 🎁' });
  for (const t of TASKS) {
    const row = progress.get(t.id)!;
    const label = `Brev ${t.id} · ${t.title}`;
    if (row.openedAt) activity.push({ at: iso(row.openedAt), kind: 'open', taskId: t.id, text: `Åpnet ${label}` });
    if (row.hint1At) activity.push({ at: iso(row.hint1At), kind: 'hint', taskId: t.id, text: `Brev ${t.id}: leste hint 1` });
    if (row.hint2At) activity.push({ at: iso(row.hint2At), kind: 'hint', taskId: t.id, text: `Brev ${t.id}: leste hint 2` });
    const answeredCorrectly = attempts.some((a) => a.taskId === t.id && a.correct);
    if (row.solvedAt && t.kind !== 'photo' && !answeredCorrectly) {
      activity.push({ at: iso(row.solvedAt), kind: 'solved', taskId: t.id, text: `${label} markert som løst` });
    }
    if (row.solvedAt && t.kind === 'photo' && !submissions.some((s) => s.taskId === t.id)) {
      activity.push({ at: iso(row.solvedAt), kind: 'solved', taskId: t.id, text: `${label} markert som løst (uten bilde)` });
    }
  }
  for (const a of attempts) {
    activity.push({
      at: iso(a.createdAt),
      kind: 'attempt',
      taskId: a.taskId,
      ok: a.correct,
      text: a.correct ? `Brev ${a.taskId}: svarte «${a.value}» — riktig` : `Brev ${a.taskId}: prøvde «${a.value}»`,
    });
  }
  for (const s of submissions) {
    activity.push({ at: iso(s.createdAt), kind: 'photo', taskId: s.taskId, text: `Brev ${s.taskId}: lastet opp bilde` });
  }
  activity.sort((a, b) => b.at.localeCompare(a.at));

  return NextResponse.json({
    now: state.now,
    eventDate: state.eventDate,
    storage: storageMode(),
    testMode: state.testMode,
    welcomedAt: app?.welcomedAt ?? null,
    giftOpenedAt: app?.giftOpenedAt ?? null,
    tasks,
    photos,
    activity: activity.slice(0, 200),
    push: {
      configured: pushConfigured(),
      devices: devices.map((d) => ({
        id: d.id,
        name: deviceName(d.userAgent),
        createdAt: d.createdAt,
        lastSuccessAt: d.lastSuccessAt,
        lastError: d.lastError,
      })),
      history: pushLogs.map((l) => ({ key: l.key, kind: l.kind, title: l.title, body: l.body, devices: l.devices, sentAt: l.sentAt })),
    },
  });
}
