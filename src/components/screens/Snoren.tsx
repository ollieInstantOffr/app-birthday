'use client';

import { useEffect, useRef, useState } from 'react';
import { TASKS, taskById } from '@/lib/content/public';
import { eventDayLabel, formatCountdown, osloClock, type GameState, type TaskView } from '../api';
import { CheckIcon, ClockIcon, LockIcon, Orbs, Shine, Stars } from '../decor';
import { Stage } from '../Stage';
import { C, G, hand, sans, serif } from '../tokens';
import type { PushStatus } from '../push';
import { Btn, PushBell } from '../ui';

// 03 · Hjem — snoren med de ti brevene.
// Posisjonene er i design-enheter fra første snor og strekkes i høyden etter skjermen.
const SLOTS: [number, number][] = [
  [16, 60], [50, 82], [84, 60],
  [16, 232], [50, 254], [84, 232],
  [16, 402], [50, 424], [84, 402],
  [50, 585],
];
const STRINGS = ['M-2 40 Q50 95 102 40', 'M-2 210 Q50 265 102 210', 'M-2 380 Q50 435 102 380', 'M-2 540 Q50 590 102 540'];
const ROW_LABELS: [number, string][] = [
  [22, 'morgen ☀'],
  [168, 'lunsj med mamma'],
  [338, 'kveld ✦'],
];
/** Fra første snor til under etiketten på gullbrevet. */
const SPAN = 700;

const COUNT = ['Ingen', 'Ett', 'To', 'Tre', 'Fire', 'Fem', 'Seks', 'Sju', 'Åtte', 'Ni', 'Ti'];

export default function Snoren({
  state,
  offset,
  onOpen,
  onGift,
  onRefresh,
  push,
}: {
  state: GameState;
  offset: number;
  onOpen: (taskId: number) => void;
  onGift: () => void;
  onRefresh: () => void;
  push?: { visible: boolean; enable: () => Promise<PushStatus> };
}) {
  const [now, setNow] = useState(() => Date.now() + offset);
  const [toast, setToast] = useState<string | null>(null);
  const refreshed = useRef<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(t);
  }, [offset]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const solved = state.tasks.filter((t) => t.status === 'solved').length;
  const active = state.tasks.find((t) => t.status === 'available' || t.status === 'timelocked');
  const remaining = active?.status === 'timelocked' && active.unlocksAt ? new Date(active.unlocksAt).getTime() - now : null;

  // Tidslåsen gikk ut mens hun så på snoren — hent ny state én gang.
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && active && refreshed.current !== active.unlocksAt) {
      refreshed.current = active.unlocksAt;
      onRefresh();
    }
  }, [remaining, active, onRefresh]);

  const tap = (view: TaskView) => {
    const task = taskById(view.id)!;
    if (view.status === 'solved' || view.status === 'available') return onOpen(view.id);
    if (view.status === 'timelocked') return setToast(`Brev ${view.id} leveres kl. ${task.unlockTime}`);
    const firstOpen = state.tasks.find((t) => t.status !== 'solved');
    setToast(firstOpen ? `Forsegle brev ${firstOpen.id} først ♥` : 'Snart ♥');
  };

  const title =
    solved === 10 ? (
      <>
        Ti brev forseglet, <span style={{ fontStyle: 'italic', color: C.rose }}>gaven venter</span>
      </>
    ) : (
      <>
        {COUNT[solved]} brev forseglet, <span style={{ fontStyle: 'italic', color: C.rose }}>{COUNT[10 - solved].toLowerCase()} venter</span>
      </>
    );

  return (
    <Stage background="linear-gradient(180deg,#FFE3EC 0%,#FFF5F7 60%,#F6E7FA 100%)" minHeight={900}>
      {({ w, h, safeTop, safeBottom }) => {
        const headerTop = Math.max(66, safeTop + 12);
        const areaTop = headerTop + 84;
        const ctaBottom = Math.max(48, safeBottom + 14);
        // Strekk eller krymp radene til plassen mellom overskriften og knappen.
        const f = Math.min(1.3, Math.max(0.82, (h - areaTop - (ctaBottom + 58 + 16)) / SPAN));

        return (
          <div style={{ width: '100%', height: '100%', position: 'relative', fontFamily: sans, color: C.plum, overflow: 'hidden' }}>
            <Orbs />
            <Stars />
            {push?.visible && !state.allSolved && (
              <PushBell
                style={{ top: headerTop - 14, right: 14 }}
                onClick={async () => {
                  const result = await push.enable();
                  setToast(
                    result === 'granted'
                      ? 'Du får varsel når neste brev kommer ♥'
                      : result === 'denied'
                        ? 'Varsler er slått av i innstillingene'
                        : 'Fikk ikke slått på varsler',
                  );
                }}
              />
            )}
            <div style={{ padding: `${headerTop}px 24px 0`, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: C.rose, fontWeight: 700 }}>
                {eventDayLabel(state.eventDate)} · kl. {osloClock(new Date(now))}
              </div>
              <div style={{ fontFamily: serif, fontSize: 30, lineHeight: '36px', fontWeight: 500, marginTop: 6 }}>{title}</div>
            </div>

            <svg viewBox="0 0 100 700" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: areaTop, width: '100%', height: SPAN * f }} fill="none">
              {STRINGS.map((d) => (
                <path key={d} d={d} stroke="#D94C82" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
            {ROW_LABELS.map(([offsetY, label]) => (
              <div key={label} style={{ position: 'absolute', left: 24, top: areaTop + offsetY * f, fontFamily: hand, fontSize: 18, color: C.muted, transform: 'rotate(-4deg)' }}>
                {label}
              </div>
            ))}

            <div style={{ position: 'absolute', left: 0, right: 0, top: areaTop, height: SPAN * f + 60 }}>
              {state.tasks.map((view, i) => {
                const [x, y] = SLOTS[i];
                const isActive = active?.id === view.id;
                const compact = isActive && x !== 50;
                const left = compact ? Math.min(Math.max((x / 100) * w, 92), w - 92) : (x / 100) * w;
                return (
                  <div
                    key={view.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Brev ${view.id}`}
                    onClick={() => tap(view)}
                    style={{ position: 'absolute', left, top: y * f, transform: 'translateX(-50%)', cursor: 'pointer', zIndex: isActive ? 2 : 1 }}
                  >
                    {view.id === 10 ? (
                      <GiftEnvelope view={view} active={isActive} allSolved={state.allSolved} />
                    ) : view.status === 'solved' ? (
                      <SolvedEnvelope view={view} i={i} />
                    ) : isActive ? (
                      <ActiveEnvelope view={view} compact={compact} />
                    ) : (
                      <LockedEnvelope view={view} i={i} />
                    )}
                  </div>
                );
              })}
            </div>

            {toast && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: ctaBottom + 80,
                  transform: 'translateX(-50%)',
                  zIndex: 5,
                  padding: '8px 18px',
                  borderRadius: 999,
                  background: '#fff',
                  border: '1px solid rgba(242,103,154,.25)',
                  boxShadow: '0 8px 24px rgba(217,76,130,.15)',
                  fontFamily: hand,
                  fontSize: 22,
                  color: C.rose,
                  whiteSpace: 'nowrap',
                  animation: 'k4-rise .3s ease both',
                }}
              >
                {toast}
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: ctaBottom + 122,
                background: 'linear-gradient(180deg,rgba(246,231,250,0),#F6E7FA 55%)',
                zIndex: 3,
                display: 'flex',
                alignItems: 'flex-end',
                padding: `0 24px ${ctaBottom}px`,
                pointerEvents: 'none',
              }}
            >
              <div style={{ width: '100%', pointerEvents: 'auto' }}>
                {state.allSolved ? (
                  <Btn variant="gold" height={62} shine onClick={onGift} style={{ animation: 'k4-pulse 2s ease-in-out infinite' }}>
                    🎁 Åpne gaven
                  </Btn>
                ) : active?.status === 'timelocked' ? (
                  <Btn variant="outlineGold" onClick={() => tap(active)}>
                    <ClockIcon size={18} color={C.goldText} stroke={2} />
                    Brev {active.id} åpner om <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCountdown(remaining ?? 0, true)}</span>
                  </Btn>
                ) : active ? (
                  <Btn variant={active.id === 10 ? 'gold' : 'pink'} shine onClick={() => onOpen(active.id)}>
                    {active.id === 10 ? 'Åpne det siste brevet' : `Åpne brev ${active.id}`}
                  </Btn>
                ) : null}
              </div>
            </div>
          </div>
        );
      }}
    </Stage>
  );
}

const sway = (i: number) => ({
  animation: `k4-sway ${3.6 + (((i * 9301 + 2 * 49297) % 233280) / 233280) * 1.6}s ease-in-out ${-(((i * 9301 + 4 * 49297) % 233280) / 233280) * 3}s infinite`,
  transformOrigin: '50% -12px',
});

function SolvedEnvelope({ view, i }: { view: TaskView; i: number }) {
  const task = TASKS[i];
  const photo = task.kind === 'photo';
  return (
    <div style={{ position: 'relative', width: 96, height: 68, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(217,76,130,.15)', ...sway(i) }}>
      <div style={{ position: 'absolute', top: -12, left: '50%', width: 12, height: 24, marginLeft: -6, background: G.goldTape, borderRadius: 3 }} />
      <div style={{ position: 'absolute', inset: 0, background: photo ? '#F6E7FA' : '#FFF5F7', clipPath: 'polygon(0 0,50% 55%,100% 0)', borderRadius: '10px 10px 0 0' }} />
      {photo && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -22,
            transform: 'translateX(-50%) rotate(-5deg)',
            width: 50,
            height: 40,
            borderRadius: 6,
            border: '3px solid #fff',
            background: 'repeating-linear-gradient(135deg,#F6D2DE 0 4px,#FBE4EB 4px 8px)',
            boxShadow: '0 6px 14px rgba(217,76,130,.2)',
            overflow: 'hidden',
          }}
        >
          {view.solved?.photoUrl && <img src={view.solved.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
      )}
      {!photo && view.solved?.answer && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -16,
            transform: 'translateX(-50%) rotate(-4deg)',
            padding: '4px 10px',
            borderRadius: 6,
            background: '#fff',
            boxShadow: '0 6px 14px rgba(217,76,130,.15)',
            fontFamily: hand,
            fontSize: 17,
            color: C.mauve,
            whiteSpace: 'nowrap',
          }}
        >
          «{view.solved.answer}»
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          right: -8,
          bottom: -8,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: C.mint,
          border: '2px solid #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(121,207,176,.4)',
        }}
      >
        <CheckIcon />
      </div>
    </div>
  );
}

function ActiveEnvelope({ view, compact }: { view: TaskView; compact: boolean }) {
  const task = taskById(view.id)!;
  const timelocked = view.status === 'timelocked';
  const first = timelocked ? `åpner kl. ${task.unlockTime}` : `brev nr. ${view.id}`;
  const second = task.short.toLowerCase();
  return (
    <div style={{ position: 'relative', width: 170, height: 118, animation: 'k4-drop 1.3s cubic-bezier(.2,.8,.2,1) .4s both', transform: compact ? 'scale(.82)' : undefined, transformOrigin: '50% 0' }}>
      <div style={{ position: 'absolute', top: -14, left: '50%', width: 16, height: 30, marginLeft: -8, background: G.goldTape, borderRadius: 4, boxShadow: '0 4px 10px rgba(200,160,90,.4)', zIndex: 3 }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: task.kind === 'photo' ? 'linear-gradient(160deg,#D7BDF0,#C9A7E8 60%,#B58FDB)' : G.envPink,
          borderRadius: 14,
          boxShadow: task.kind === 'photo' ? '0 18px 40px rgba(181,143,219,.4)' : '0 18px 40px rgba(217,76,130,.35)',
          overflow: 'hidden',
        }}
      >
        <Shine opacity={0.4} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: task.kind === 'photo' ? 'linear-gradient(180deg,#E9D8F7,#D7BDF0)' : G.flapPink,
          clipPath: 'polygon(0 0,50% 60%,100% 0)',
          borderRadius: '14px 14px 0 0',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 60,
          transform: 'translate(-50%,-50%)',
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: G.gold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: serif,
          fontSize: 24,
          boxShadow: '0 6px 16px rgba(0,0,0,.15),inset 0 2px 4px rgba(255,255,255,.6)',
          animation: 'k4-beat 2s ease-in-out infinite',
        }}
      >
        {timelocked ? <ClockIcon /> : view.id}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 124,
          transform: 'translateX(-50%)',
          fontFamily: hand,
          fontSize: compact ? 25 : 22,
          lineHeight: compact ? '24px' : '22px',
          color: C.rose,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {/* To korte linjer, så etiketten holder seg mellom brevene i raden under. */}
        {first}
        <br />
        <span style={{ fontWeight: 500, fontSize: compact ? 22 : 20 }}>{second}</span>
      </div>
    </div>
  );
}

function LockedEnvelope({ view, i }: { view: TaskView; i: number }) {
  const task = taskById(view.id)!;
  return (
    <div style={{ position: 'relative', width: 86, height: 60, background: '#FDE7EE', border: '1px solid rgba(242,103,154,.2)', borderRadius: 9, ...sway(i) }}>
      <div style={{ position: 'absolute', top: -10, left: '50%', width: 10, height: 20, marginLeft: -5, background: C.gold, borderRadius: 3, opacity: 0.7 }} />
      <div style={{ position: 'absolute', inset: 0, background: '#FFF0F4', clipPath: 'polygon(0 0,50% 55%,100% 0)', borderRadius: '9px 9px 0 0' }} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-40%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: C.gold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LockIcon />
      </div>
      {task.unlockTime && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -18,
            transform: 'translateX(-50%)',
            padding: '2px 8px',
            borderRadius: 999,
            background: '#fff',
            border: '1px solid rgba(228,192,138,.6)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            color: C.goldText,
            whiteSpace: 'nowrap',
          }}
        >
          kl. {task.unlockTime}
        </div>
      )}
    </div>
  );
}

function GiftEnvelope({ view, active, allSolved }: { view: TaskView; active: boolean; allSolved: boolean }) {
  const label = allSolved
    ? 'Ti brev forseglet · åpne gaven'
    : view.status === 'timelocked' || !active
      ? 'Den siste låsen · 18:15'
      : 'Den siste låsen · åpen nå';
  const big = active || allSolved;
  return (
    <div style={{ position: 'relative', width: big ? 150 : 120, height: big ? 102 : 82, animation: 'k4-sway 5s ease-in-out infinite', transformOrigin: '50% -12px', transition: 'width .4s, height .4s' }}>
      {allSolved && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 120, height: 120, margin: -60, borderRadius: '50%', background: C.gold, animation: 'k4-halo 3s ease-out infinite' }} />
      )}
      <div style={{ position: 'absolute', top: -12, left: '50%', width: 14, height: 26, marginLeft: -7, background: C.rose, borderRadius: 3, zIndex: 3 }} />
      <div style={{ position: 'absolute', inset: 0, background: G.gold, borderRadius: 12, boxShadow: '0 12px 30px rgba(200,160,90,.4)', overflow: 'hidden' }}>
        <Shine width="40%" opacity={0.5} duration={3.4} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#F7E6C0,#EBD09E)', clipPath: 'polygon(0 0,50% 58%,100% 0)', borderRadius: '12px 12px 0 0' }} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: big ? 54 : 44,
          transform: 'translate(-50%,-50%)',
          width: big ? 42 : 34,
          height: big ? 42 : 34,
          borderRadius: '50%',
          background: C.rose,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 16,
          boxShadow: '0 4px 12px rgba(217,76,130,.4)',
          animation: big ? 'k4-beat 2s ease-in-out infinite' : undefined,
        }}
      >
        {view.status === 'timelocked' && active ? <ClockIcon size={18} /> : '♥'}
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: -28, transform: 'translateX(-50%)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.goldText, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  );
}
