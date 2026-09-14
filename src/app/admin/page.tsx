'use client';

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

type Status = 'solved' | 'available' | 'timelocked' | 'locked';

interface AdminTask {
  id: number;
  title: string;
  kind: 'question' | 'photo' | 'song';
  unlockTime: string | null;
  status: Status;
  manualUnlock: boolean;
  openedAt: string | null;
  solvedAt: string | null;
  attemptCount: number;
  hint1At: string | null;
  hint2At: string | null;
  photoCount: number;
  photoUrl: string | null;
  attempts: { id: number; value: string; correct: boolean; createdAt: string }[];
}

interface AdminPhoto {
  id: number;
  taskId: number;
  title: string;
  caption: string;
  createdAt: string;
  url: string;
  latest: boolean;
}

interface Activity {
  at: string;
  kind: 'welcome' | 'open' | 'attempt' | 'hint' | 'photo' | 'solved' | 'gift';
  taskId: number | null;
  text: string;
  ok?: boolean;
}

interface AdminState {
  now: string;
  eventDate: string;
  storage: 's3' | 'local';
  testMode: boolean;
  welcomedAt: string | null;
  giftOpenedAt: string | null;
  tasks: AdminTask[];
  photos: AdminPhoto[];
  activity: Activity[];
  push: PushInfo;
}

interface PushInfo {
  configured: boolean;
  devices: { id: number; name: string; createdAt: string; lastSuccessAt: string | null; lastError: string | null }[];
  history: { key: string; kind: 'scheduled' | 'custom'; title: string | null; body: string | null; devices: number | null; sentAt: string }[];
}

/* ---------------------------------------------------------------- stil */

const C = {
  plum: '#4A2233',
  mauve: '#8A6273',
  muted: '#B07D95',
  rose: '#D94C82',
  pink: '#F2679A',
  gold: '#E4C08A',
  goldText: '#B08A4A',
  mint: '#79CFB0',
  lav: '#C9A7E8',
  blush: '#FFF5F7',
  line: 'rgba(242,103,154,.18)',
};
const serif = "var(--f-serif), Fraunces, Georgia, serif";

const STATUS: Record<Status, { label: string; color: string; bg: string }> = {
  solved: { label: 'Forseglet', color: '#2F7A60', bg: '#E3F6EF' },
  available: { label: 'Åpen nå', color: '#B93A6B', bg: '#FDE7EE' },
  timelocked: { label: 'Venter på klokka', color: '#8A6A2E', bg: '#FBEFD9' },
  locked: { label: 'Låst', color: '#8A6273', bg: '#F3ECEF' },
};

const ACTIVITY_ICON: Record<Activity['kind'], string> = {
  welcome: '💌',
  open: '✉️',
  attempt: '✎',
  hint: '💡',
  photo: '📷',
  solved: '✅',
  gift: '🎁',
};

const clock = (iso: string | null, seconds = false) =>
  iso
    ? new Intl.DateTimeFormat('nb-NO', {
        timeZone: 'Europe/Oslo',
        hour: '2-digit',
        minute: '2-digit',
        ...(seconds ? { second: '2-digit' } : {}),
      }).format(new Date(iso))
    : '—';

const card: CSSProperties = {
  background: '#fff',
  border: `1px solid ${C.line}`,
  borderRadius: 20,
  padding: 18,
  boxShadow: '0 8px 28px rgba(217,76,130,.08)',
};

const eyebrow: CSSProperties = { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.mauve, fontWeight: 700 };

const pill = (bg: string, color: string): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  fontWeight: 700,
  padding: '3px 10px',
  borderRadius: 999,
  background: bg,
  color,
  whiteSpace: 'nowrap',
});

function Button({
  children,
  onClick,
  tone = 'plain',
  disabled,
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: 'plain' | 'pink' | 'gold' | 'danger';
  disabled?: boolean;
  small?: boolean;
}) {
  const tones: Record<string, CSSProperties> = {
    plain: { background: '#fff', color: C.plum, border: `1px solid ${C.line}` },
    pink: { background: 'linear-gradient(135deg,#F98DB4,#F2679A 55%,#E2568A)', color: '#fff' },
    gold: { background: 'linear-gradient(135deg,#F7E6C0,#E4C08A 50%,#CBA36A)', color: C.plum },
    danger: { background: '#fff', color: '#B93A6B', border: '1px solid rgba(217,76,130,.45)' },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: 999,
        padding: small ? '6px 12px' : '9px 16px',
        fontSize: small ? 12 : 14,
        fontWeight: 700,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        ...tones[tone],
      }}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- side */

export default function AdminPage() {
  const [data, setData] = useState<AdminState | null>(null);
  const [auth, setAuth] = useState<'unknown' | 'no' | 'yes'>('unknown');
  const [busy, setBusy] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/state', { cache: 'no-store' });
      if (res.status === 401) return setAuth('no');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setAuth('yes');
      setUpdatedAt(new Date().toISOString());
      setError(null);
    } catch {
      setError('Fikk ikke hentet status. Prøver igjen…');
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [load]);

  const post = async (path: string, body?: unknown, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(path);
    try {
      await fetch(path, {
        method: 'POST',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (auth === 'unknown') return <main style={page}>Laster…</main>;
  if (auth === 'no') return <Login onDone={load} />;
  if (!data) return <main style={page}>Laster…</main>;

  const solved = data.tasks.filter((t) => t.status === 'solved').length;
  const current = data.tasks.find((t) => t.status === 'available' || t.status === 'timelocked');
  const nextLock = data.tasks.find((t) => t.status !== 'solved' && t.unlockTime && new Date(`${data.eventDate}T${t.unlockTime}:00`) > new Date(data.now));

  return (
    <main style={page}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* topp */}
        <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ ...eyebrow, color: C.rose }}>Admin</div>
            <h1 style={{ margin: '2px 0 0', fontFamily: serif, fontWeight: 500, fontSize: 30 }}>
              Bursdags<span style={{ fontStyle: 'italic', color: C.rose }}>jakten</span>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: C.mauve }}>
              {error ?? `Oppdatert ${clock(updatedAt, true)} · hvert 15. sek`}
            </span>
            <Button small onClick={load}>
              Oppdater
            </Button>
            <a href="/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <Button small>Åpne appen ↗</Button>
            </a>
            <Button
              small
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' });
                setAuth('no');
                setData(null);
              }}
            >
              Logg ut
            </Button>
          </div>
        </header>

        {/* testmodus */}
        <section
          style={{
            ...card,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            background: data.testMode ? 'linear-gradient(135deg,#FFF6E6,#FBE7C8)' : '#fff',
            border: data.testMode ? '1.5px solid rgba(228,192,138,.9)' : card.border,
          }}
        >
          <div style={{ flex: '1 1 420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <strong style={{ fontSize: 18 }}>Testmodus</strong>
              <span style={pill(data.testMode ? C.gold : '#F3ECEF', data.testMode ? C.plum : C.mauve)}>{data.testMode ? 'PÅ' : 'AV'}</span>
            </div>
            <div style={{ fontSize: 14, color: C.mauve, marginTop: 6, lineHeight: '20px' }}>
              Fjerner tidslåsene (07:00, 13:15, 18:15), gjør hint tilgjengelige med en gang, og lar deg åpne finalen fra en knapp øverst i appen.
              Brevene må fortsatt løses i rekkefølge. Fremdriften lagres som vanlig.
            </div>
            {data.testMode && (
              <div style={{ fontSize: 13, color: '#8A6A2E', marginTop: 8, fontWeight: 700 }}>
                ⚠️ Husk å slå av testmodus og nullstille før {new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long' }).format(new Date(`${data.eventDate}T12:00:00`))}.
              </div>
            )}
          </div>
          <Toggle
            checked={data.testMode}
            disabled={busy === '/api/admin/test-mode'}
            onChange={(enabled) => post('/api/admin/test-mode', { enabled })}
          />
        </section>

        {/* varsler */}
        <PushCard push={data.push} testMode={data.testMode} onSent={load} />

        {/* oversikt */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          <Stat label="Forseglet">
            <div style={{ fontFamily: serif, fontSize: 28 }}>
              {solved}
              <span style={{ color: C.muted, fontSize: 18 }}> / 10</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: '#F6E7EE', marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${solved * 10}%`, height: '100%', background: 'linear-gradient(90deg,#F98DB4,#E2568A)', transition: 'width .5s' }} />
            </div>
          </Stat>
          <Stat label="Hun er på">
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {solved === 10 ? (data.giftOpenedAt ? 'Har åpnet gaven 🎁' : 'Finalen') : current ? `Brev ${current.id} · ${current.title}` : '—'}
            </div>
            {current && <div style={{ fontSize: 12, color: C.mauve, marginTop: 4 }}>{STATUS[current.status].label}</div>}
          </Stat>
          <Stat label="Neste tidslås">
            <div style={{ fontSize: 16, fontWeight: 700 }}>{nextLock ? `Brev ${nextLock.id} · kl. ${nextLock.unlockTime}` : '—'}</div>
            <div style={{ fontSize: 12, color: C.mauve, marginTop: 4 }}>Dag: {data.eventDate}</div>
          </Stat>
          <Stat label="Velkomst / gaven">
            <div style={{ fontSize: 14 }}>Snoren hengt opp: {clock(data.welcomedAt)}</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Gaven åpnet: {clock(data.giftOpenedAt)}</div>
          </Stat>
          <Stat label="Bilder">
            <div style={{ fontFamily: serif, fontSize: 28 }}>{data.photos.length}</div>
            <div style={{ fontSize: 12, color: C.mauve, marginTop: 4 }}>Lagring: {data.storage === 's3' ? 'S3' : 'lokalt'}</div>
          </Stat>
        </section>

        {/* brev + aktivitet */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 16, alignItems: 'start' }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={h2}>Brevene</h2>
            {data.tasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                busy={busy}
                onUnlock={() => post(`/api/admin/unlock/${t.id}`, undefined, `Åpne brev ${t.id} nå, uten å vente til kl. ${t.unlockTime}?`)}
                onSolve={() => post(`/api/admin/solve/${t.id}`, undefined, `Marker brev ${t.id} som løst?`)}
                onReset={() =>
                  post(
                    `/api/admin/reset-task/${t.id}`,
                    undefined,
                    `Nullstille brev ${t.id}? Fremdrift, forsøk${t.photoCount ? ' og bildene' : ''} for dette brevet slettes.`,
                  )
                }
                onPhoto={() => {
                  const index = data.photos.findIndex((p) => p.taskId === t.id && p.latest);
                  if (index >= 0) setLightbox(index);
                }}
              />
            ))}
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'sticky', top: 16 }}>
            <h2 style={h2}>Aktivitet</h2>
            <div style={{ ...card, padding: 0, maxHeight: 720, overflowY: 'auto' }}>
              {data.activity.length === 0 ? (
                <div style={{ padding: 18, color: C.mauve, fontSize: 14 }}>Ingenting har skjedd ennå.</div>
              ) : (
                data.activity.map((a, i) => (
                  <div
                    key={`${a.at}-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '64px 22px 1fr',
                      gap: 8,
                      alignItems: 'baseline',
                      padding: '10px 16px',
                      borderTop: i ? `1px solid ${C.line}` : 'none',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ fontSize: 12, color: C.mauve, fontVariantNumeric: 'tabular-nums' }}>{clock(a.at, true)}</span>
                    <span>{a.kind === 'attempt' ? (a.ok ? '✅' : '✗') : ACTIVITY_ICON[a.kind]}</span>
                    <span style={{ color: a.kind === 'attempt' && !a.ok ? '#B93A6B' : C.plum }}>{a.text}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* bilder */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={h2}>Bildene hun har lastet opp</h2>
          {data.photos.length === 0 ? (
            <div style={{ ...card, color: C.mauve, fontSize: 14 }}>Ingen bilder ennå.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
              {data.photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightbox(i)}
                  style={{ ...card, padding: 8, textAlign: 'left', cursor: 'zoom-in', opacity: p.latest ? 1 : 0.6 }}
                >
                  <img src={p.url} alt={p.caption} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 12, background: '#F6E7EE' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>
                    Brev {p.taskId} · {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.mauve }}>
                    kl. {clock(p.createdAt)}
                    {!p.latest && ' · byttet ut'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* faresone */}
        <DangerZone busy={busy === '/api/admin/reset'} onReset={(options) => post('/api/admin/reset', options)} />
      </div>

      {lightbox !== null && data.photos[lightbox] && (
        <Lightbox photos={data.photos} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
      )}
    </main>
  );
}

/* ---------------------------------------------------------- komponenter */

const QUICK_MESSAGES = [
  'Sjekk snoren din ♥',
  'Et nytt brev venter på deg 💌',
  'Husk lunsjen med mamma 🍜',
  'Gleder meg til middag i kveld ✨',
  'Du er best. Fortsett jakten!',
];

function PushCard({ push, testMode, onSent }: { push: PushInfo; testMode: boolean; onSent: () => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const devices = push.devices.length;

  const send = async () => {
    const text = body.trim();
    if (!text) return;
    const heading = title.trim() || 'Bursdagsjakten 💌';
    if (!window.confirm(`Sende varsel til Regine nå?\n\n${heading}\n${text}`)) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: heading, body: text }),
      });
      const json = (await res.json()) as { sent?: number; failed?: number; error?: string };
      if (!res.ok) setResult({ ok: false, text: json.error ?? 'Noe gikk galt' });
      else if (json.sent) {
        setResult({ ok: true, text: `Sendt til ${json.sent} enhet${json.sent === 1 ? '' : 'er'} ✓` });
        setBody('');
      } else setResult({ ok: false, text: json.failed ? `Kunne ikke levere varselet (${json.failed} feilet)` : 'Hun har ingen enheter med varsler på' });
      await onSent();
    } catch {
      setResult({ ok: false, text: 'Fikk ikke kontakt med serveren' });
    } finally {
      setSending(false);
    }
  };

  const field: CSSProperties = { border: '1px solid rgba(242,103,154,.35)', borderRadius: 12, padding: '10px 12px', fontSize: 15, background: '#fff', width: '100%', fontFamily: 'inherit' };

  return (
    <section style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 18 }}>Varsler til Regine</strong>
          {!push.configured ? (
            <span style={pill('#FDE7EE', '#B93A6B')}>Ikke satt opp</span>
          ) : devices ? (
            <span style={pill('#E3F6EF', '#2F7A60')}>
              På · {devices} enhet{devices === 1 ? '' : 'er'}
            </span>
          ) : (
            <span style={pill('#F3ECEF', C.mauve)}>Ikke slått på ennå</span>
          )}
        </div>

        {!push.configured ? (
          <div style={{ fontSize: 14, color: '#B93A6B' }}>VAPID-nøklene mangler i .env, så varsler kan ikke sendes.</div>
        ) : devices === 0 ? (
          <div style={{ fontSize: 14, color: C.mauve, lineHeight: '20px' }}>
            Hun slår på varsler med 🔔-knappen øverst i appen. På iPhone vises knappen bare når appen er åpnet fra hjemskjermen.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {push.devices.map((d) => (
              <div key={d.id} style={{ fontSize: 13, color: d.lastError ? '#B93A6B' : C.mauve }}>
                📱 {d.name} · slått på kl. {clock(d.createdAt)}
                {d.lastSuccessAt ? ` · siste levert kl. ${clock(d.lastSuccessAt)}` : ''}
                {d.lastError ? ` · feil: ${d.lastError}` : ''}
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 13, color: C.mauve, lineHeight: '19px' }}>
          Automatisk: kl. 07:00, 13:15 og 18:15 når et tidslåst brev kommer{testMode ? ' — sendes ikke i testmodus' : ''}.
        </div>

        {push.history.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={eyebrow}>Sendt</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, maxHeight: 180, overflowY: 'auto' }}>
              {push.history.map((h) => (
                <div key={h.key} style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '44px 1fr', gap: 8 }}>
                  <span style={{ color: C.mauve, fontVariantNumeric: 'tabular-nums' }}>{clock(h.sentAt)}</span>
                  <span>
                    <strong>{h.title}</strong> — {h.body}
                    <span style={{ color: C.mauve }}>
                      {' '}
                      · {h.kind === 'custom' ? 'egen' : 'automatisk'}
                      {h.devices !== null ? ` · ${h.devices} levert` : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={eyebrow}>Send eget varsel</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tittel (Bursdagsjakten 💌)" maxLength={60} style={field} />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Melding til Regine…"
          maxLength={180}
          rows={3}
          style={{ ...field, resize: 'vertical' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK_MESSAGES.map((m) => (
            <button key={m} type="button" onClick={() => setBody(m)} style={{ ...pill('#FFF5F7', C.rose), border: `1px solid ${C.line}`, cursor: 'pointer', fontWeight: 500 }}>
              {m}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
          <span style={{ fontSize: 12, color: C.mauve }}>{body.length} / 180</span>
          <Button tone="pink" onClick={send} disabled={sending || !body.trim() || !push.configured || devices === 0}>
            {sending ? 'Sender…' : 'Send til Regine'}
          </Button>
        </div>
        {result && <div style={{ fontSize: 14, fontWeight: 700, color: result.ok ? '#2F7A60' : '#B93A6B' }}>{result.text}</div>}
      </div>
    </section>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <main style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form
        style={{ ...card, width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12, padding: 28 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const res = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: password }),
          });
          setBusy(false);
          setError(!res.ok);
          if (res.ok) onDone();
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#F7E6C0,#E4C08A 50%,#CBA36A)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            alignSelf: 'center',
          }}
        >
          ♥
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...eyebrow, color: C.rose }}>Admin</div>
          <h1 style={{ margin: '4px 0 0', fontFamily: serif, fontWeight: 500, fontSize: 26 }}>Bursdagsjakten</h1>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Passord"
          autoFocus
          autoComplete="current-password"
          style={{ border: `1px solid ${error ? C.rose : 'rgba(242,103,154,.4)'}`, borderRadius: 12, padding: '12px 14px', fontSize: 16, background: '#fff' }}
        />
        {error && <div style={{ color: C.rose, fontSize: 14 }}>Feil passord</div>}
        <button
          type="submit"
          disabled={busy || !password}
          style={{
            borderRadius: 999,
            padding: '12px 16px',
            fontWeight: 700,
            fontSize: 15,
            color: '#fff',
            background: 'linear-gradient(135deg,#F98DB4,#F2679A 55%,#E2568A)',
            opacity: busy || !password ? 0.6 : 1,
          }}
        >
          {busy ? 'Logger inn…' : 'Logg inn'}
        </button>
      </form>
    </main>
  );
}

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Testmodus"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 64,
        height: 36,
        borderRadius: 999,
        padding: 4,
        background: checked ? 'linear-gradient(135deg,#F7E6C0,#E4C08A 50%,#CBA36A)' : '#E9DDE2',
        display: 'flex',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        transition: 'background .2s',
        opacity: disabled ? 0.6 : 1,
        flex: 'none',
      }}
    >
      <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} />
    </button>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={card}>
      <div style={eyebrow}>{label}</div>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function TaskRow({
  task: t,
  busy,
  onUnlock,
  onSolve,
  onReset,
  onPhoto,
}: {
  task: AdminTask;
  busy: string | null;
  onUnlock: () => void;
  onSolve: () => void;
  onReset: () => void;
  onPhoto: () => void;
}) {
  const s = STATUS[t.status];
  const touched = t.openedAt || t.solvedAt || t.attemptCount || t.photoCount || t.manualUnlock;
  return (
    <div style={{ ...card, padding: 14, display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 12, alignItems: 'start' }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: serif,
          fontSize: 18,
          color: t.status === 'solved' ? '#fff' : C.plum,
          background: t.status === 'solved' ? C.mint : t.status === 'available' ? '#FDE7EE' : '#F6F0F2',
          border: t.status === 'available' ? `2px solid ${C.pink}` : 'none',
        }}
      >
        {t.status === 'solved' ? '✓' : t.id}
      </div>

      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 16 }}>
            {t.id}. {t.title}
          </strong>
          <span style={pill(s.bg, s.color)}>{s.label}</span>
          <span style={{ fontSize: 12, color: C.mauve }}>
            {t.kind === 'photo' ? '📷 bilde' : t.kind === 'song' ? '♪ sang' : '✎ spørsmål'}
            {t.unlockTime ? ` · 🔒 ${t.unlockTime}` : ''}
            {t.manualUnlock ? ' · låst opp manuelt' : ''}
          </span>
        </div>
        <div style={{ fontSize: 13, color: C.mauve, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span>Åpnet {clock(t.openedAt)}</span>
          <span>Løst {clock(t.solvedAt)}</span>
          {t.kind !== 'photo' && <span>{t.attemptCount} feil</span>}
          {t.kind !== 'photo' && (
            <span>
              Hint {t.hint1At ? `1 (${clock(t.hint1At)})` : '—'}
              {t.hint2At ? ` · 2 (${clock(t.hint2At)})` : ''}
            </span>
          )}
          {t.kind === 'photo' && <span>{t.photoCount} bilde{t.photoCount === 1 ? '' : 'r'}</span>}
        </div>
        {t.attempts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {t.attempts.map((a) => (
              <span
                key={a.id}
                title={clock(a.createdAt, true)}
                style={{ ...pill(a.correct ? '#E3F6EF' : '#FDE7EE', a.correct ? '#2F7A60' : '#B93A6B'), fontWeight: 500 }}
              >
                {a.correct ? '✓' : '✗'} {a.value}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
          {t.status === 'timelocked' && (
            <Button small tone="gold" onClick={onUnlock} disabled={busy !== null}>
              Åpne før kl. {t.unlockTime}
            </Button>
          )}
          {t.status !== 'solved' && (
            <Button small onClick={onSolve} disabled={busy !== null}>
              Marker som løst
            </Button>
          )}
          {touched ? (
            <Button small tone="danger" onClick={onReset} disabled={busy !== null}>
              Nullstill brev
            </Button>
          ) : null}
        </div>
      </div>

      {t.photoUrl ? (
        <button type="button" onClick={onPhoto} style={{ cursor: 'zoom-in' }}>
          <img src={t.photoUrl} alt="" style={{ width: 72, height: 90, objectFit: 'cover', borderRadius: 10, border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }} />
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}

function Lightbox({ photos, index, onIndex, onClose }: { photos: AdminPhoto[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const photo = photos[index];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < photos.length - 1) onIndex(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, photos.length, onIndex, onClose]);

  const nav: CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(255,255,255,.15)',
    color: '#fff',
    fontSize: 22,
    flex: 'none',
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,14,22,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 }}
    >
      <button type="button" aria-label="Forrige" style={{ ...nav, visibility: index > 0 ? 'visible' : 'hidden' }} onClick={(e) => (e.stopPropagation(), onIndex(index - 1))}>
        ‹
      </button>
      <figure onClick={(e) => e.stopPropagation()} style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, maxWidth: 'min(900px, 100%)' }}>
        <img src={photo.url} alt={photo.caption} style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,.5)' }} />
        <figcaption style={{ color: '#FFF5F7', textAlign: 'center', fontSize: 14 }}>
          <strong>
            Brev {photo.taskId} · {photo.title}
          </strong>{' '}
          · kl. {clock(photo.createdAt, true)} · {index + 1} / {photos.length}
          <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <a href={photo.url} target="_blank" rel="noreferrer" style={{ color: C.gold, fontWeight: 700 }}>
              Åpne original ↗
            </a>
            <button type="button" onClick={onClose} style={{ color: '#FFF5F7', fontWeight: 700 }}>
              Lukk ✕
            </button>
          </div>
        </figcaption>
      </figure>
      <button
        type="button"
        aria-label="Neste"
        style={{ ...nav, visibility: index < photos.length - 1 ? 'visible' : 'hidden' }}
        onClick={(e) => (e.stopPropagation(), onIndex(index + 1))}
      >
        ›
      </button>
    </div>
  );
}

function DangerZone({
  busy,
  onReset,
}: {
  busy: boolean;
  onReset: (options: { deleteImages: boolean; logoutDevices: boolean }) => void;
}) {
  const [deleteImages, setDeleteImages] = useState(false);
  const [logoutDevices, setLogoutDevices] = useState(false);
  const checkbox: CSSProperties = { appearance: 'auto', width: 16, height: 16, flex: 'none', marginTop: 2 };
  const row: CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10, fontSize: 14, lineHeight: '20px' };
  const full = deleteImages && logoutDevices;

  return (
    <section style={{ ...card, border: '1.5px solid rgba(217,76,130,.35)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ flex: '1 1 420px' }}>
        <strong style={{ fontSize: 16, color: '#B93A6B' }}>Nullstill appen</strong>
        <div style={{ fontSize: 14, color: C.mauve, marginTop: 6, lineHeight: '20px' }}>
          Sletter all fremdrift, alle forsøk, hint, bildekoblinger og varselloggen, så jakten starter helt på nytt. Testmodus beholdes som den er.
        </div>
        <label style={row}>
          <input type="checkbox" checked={deleteImages} onChange={(e) => setDeleteImages(e.target.checked)} style={checkbox} />
          <span>Slett også de opplastede bildene fra lagringen</span>
        </label>
        <label style={row}>
          <input type="checkbox" checked={logoutDevices} onChange={(e) => setLogoutDevices(e.target.checked)} style={checkbox} />
          <span>
            Logg ut alle innloggede enheter
            <span style={{ display: 'block', fontSize: 12, color: C.mauve }}>
              Regine må skrive inn fødselsdatoen på nytt, og varsler må slås på igjen. Du forblir logget inn her.
            </span>
          </span>
        </label>
        <button
          type="button"
          onClick={() => {
            setDeleteImages(true);
            setLogoutDevices(true);
          }}
          style={{ marginTop: 10, fontSize: 13, color: C.rose, fontWeight: 700, textDecoration: 'underline' }}
        >
          Velg full nullstilling
        </button>
      </div>
      <Button
        tone="danger"
        disabled={busy}
        onClick={() => {
          const parts = ['All fremdrift og alle forsøk slettes.'];
          if (deleteImages) parts.push('Alle opplastede bilder slettes.');
          if (logoutDevices) parts.push('Alle Regines enheter logges ut, og varsel-enhetene fjernes.');
          if (window.confirm(`${full ? 'Full nullstilling' : 'Nullstille appen'}?\n\n${parts.join('\n')}\n\nDette kan ikke angres.`)) {
            onReset({ deleteImages, logoutDevices });
          }
        }}
      >
        {busy ? 'Nullstiller…' : full ? 'Nullstill helt' : 'Nullstill alt'}
      </Button>
    </section>
  );
}

const page: CSSProperties = {
  height: '100dvh',
  overflowY: 'auto',
  background: 'linear-gradient(180deg,#FFF5F7 0%,#FDF0F4 100%)',
  color: C.plum,
  padding: 'max(16px, env(safe-area-inset-top)) 16px 40px',
  fontSize: 14,
};

const h2: CSSProperties = { margin: '4px 0 0', fontFamily: serif, fontWeight: 500, fontSize: 22 };
