export const TZ = 'Europe/Oslo';

export function eventDate(): string {
  return process.env.EVENT_DATE || '2026-09-18';
}

/** Oslo sin UTC-forskyvning på en gitt dato, f.eks. "+02:00". */
function osloOffset(date: string): string {
  const probe = new Date(`${date}T12:00:00Z`);
  const part = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(probe)
    .find((p) => p.type === 'timeZoneName')?.value; // "GMT+2"
  const m = part?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return '+02:00';
  return `${m[1]}${m[2].padStart(2, '0')}:${m[3] ?? '00'}`;
}

/** "07:00" på dagen → Date. */
export function atEventTime(hhmm: string): Date {
  const d = eventDate();
  return new Date(`${d}T${hhmm}:00${osloOffset(d)}`);
}
