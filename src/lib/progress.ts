import 'server-only';
import type { Progress } from '@prisma/client';
import { prisma } from './db';
import { TASKS, taskById, type PublicTask } from './content/public';
import { SECRETS, type StarReveal } from './content/secret';
import { atEventTime } from './time';

export type TaskStatus = 'solved' | 'available' | 'timelocked' | 'locked';

export const HINT_DELAY_MS = 5 * 60 * 1000;
const HINT2_AFTER_ATTEMPTS = 5;

export interface TaskView {
  id: number;
  status: TaskStatus;
  unlocksAt: string | null;
  attemptCount: number;
  hint: {
    has1: boolean;
    has2: boolean;
    available1: boolean;
    available2: boolean;
    /** Tidspunktet hint 1 blir tilgjengelig av seg selv (5 min etter åpning). */
    available1At: string | null;
    text1: string | null;
    text2: string | null;
  };
  solved: null | {
    at: string;
    answer: string | null;
    message: string;
    route: string[] | null;
    star: StarReveal | null;
    photoUrl: string | null;
  };
}

export interface GameState {
  now: string;
  eventDate: string;
  welcomed: boolean;
  giftOpened: boolean;
  allSolved: boolean;
  testMode: boolean;
  tasks: TaskView[];
}

const empty = (taskId: number): Progress => ({
  taskId,
  solvedAt: null,
  manualUnlock: false,
  openedAt: null,
  attemptCount: 0,
  hint1At: null,
  attemptsAtHint1: null,
  hint2At: null,
});

export async function loadProgress(): Promise<Map<number, Progress>> {
  const rows = await prisma.progress.findMany();
  const map = new Map(rows.map((r) => [r.taskId, r]));
  for (const t of TASKS) if (!map.has(t.id)) map.set(t.id, empty(t.id));
  return map;
}

export function unlocksAt(task: PublicTask): Date | null {
  return task.unlockTime ? atEventTime(task.unlockTime) : null;
}

export function statusOf(taskId: number, progress: Map<number, Progress>, now: Date, testMode = false): TaskStatus {
  const task = taskById(taskId)!;
  const row = progress.get(taskId)!;
  if (row.solvedAt) return 'solved';
  if (row.manualUnlock || testMode) return 'available';
  const prev = progress.get(taskId - 1);
  if (prev && !prev.solvedAt) return 'locked';
  const at = unlocksAt(task);
  if (at && now < at) return 'timelocked';
  return 'available';
}

export function hintAvailability(row: Progress, now: Date, testMode = false) {
  const secret = SECRETS[row.taskId];
  const has1 = Boolean(secret?.hint1);
  const has2 = Boolean(secret?.hint2);
  const available1At = row.openedAt ? new Date(row.openedAt.getTime() + HINT_DELAY_MS) : null;
  const available1 = has1 && (testMode || row.attemptCount >= 2 || (available1At !== null && now >= available1At));
  const available2 =
    has2 &&
    (testMode ||
      (row.hint1At !== null &&
        (row.attemptCount >= (row.attemptsAtHint1 ?? 0) + 1 || row.attemptCount >= HINT2_AFTER_ATTEMPTS)));
  return { has1, has2, available1, available2, available1At };
}

export function photoUrl(taskId: number, submissionId: number) {
  return `/api/photos/${taskId}?v=${submissionId}`;
}

export async function buildState(): Promise<GameState> {
  const now = new Date();
  const [progress, app, submissions] = await Promise.all([
    loadProgress(),
    prisma.appState.findUnique({ where: { id: 1 } }),
    prisma.submission.findMany({ orderBy: { id: 'desc' } }),
  ]);
  const testMode = Boolean(app?.testMode);
  const latestPhoto = new Map<number, number>();
  for (const s of submissions) if (!latestPhoto.has(s.taskId)) latestPhoto.set(s.taskId, s.id);

  const tasks = TASKS.map((task): TaskView => {
    const row = progress.get(task.id)!;
    const secret = SECRETS[task.id];
    const status = statusOf(task.id, progress, now, testMode);
    const h = hintAvailability(row, now, testMode);
    const at = unlocksAt(task);
    return {
      id: task.id,
      status,
      unlocksAt: at ? at.toISOString() : null,
      attemptCount: row.attemptCount,
      hint: {
        has1: h.has1,
        has2: h.has2,
        available1: h.available1,
        available2: h.available2,
        available1At: h.available1At ? h.available1At.toISOString() : null,
        text1: row.hint1At || status === 'solved' ? (secret.hint1 ?? null) : null,
        text2: row.hint2At || status === 'solved' ? (secret.hint2 ?? null) : null,
      },
      solved:
        status === 'solved'
          ? {
              at: row.solvedAt!.toISOString(),
              answer: secret.answer ?? null,
              message: secret.message,
              route: secret.route ?? null,
              star: secret.star ?? null,
              photoUrl: latestPhoto.has(task.id) ? photoUrl(task.id, latestPhoto.get(task.id)!) : null,
            }
          : null,
    };
  });

  return {
    now: now.toISOString(),
    eventDate: process.env.EVENT_DATE || '2026-09-18',
    welcomed: Boolean(app?.welcomedAt),
    giftOpened: Boolean(app?.giftOpenedAt),
    allSolved: tasks.every((t) => t.status === 'solved'),
    testMode,
    tasks,
  };
}

export async function upsertProgress(taskId: number, data: Partial<Omit<Progress, 'taskId'>>) {
  return prisma.progress.upsert({ where: { taskId }, create: { taskId, ...data }, update: data });
}

export async function getTestMode(): Promise<boolean> {
  const app = await prisma.appState.findUnique({ where: { id: 1 } });
  return Boolean(app?.testMode);
}

/** Fremdrift + testmodus i ett kall — det de fleste rutene trenger. */
export async function loadContext() {
  const [progress, testMode] = await Promise.all([loadProgress(), getTestMode()]);
  return { progress, testMode, now: new Date() };
}

export function parseTaskId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && taskById(id) ? id : null;
}
