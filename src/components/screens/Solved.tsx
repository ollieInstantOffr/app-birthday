'use client';

import { useState } from 'react';
import type { PublicTask } from '@/lib/content/public';
import type { TaskView } from '../api';
import { Confetti, Orbs, Sky, Stamp } from '../decor';
import { Stage } from '../Stage';
import { C, G, eyebrow, hand, padBottom, padTop, sans, serif } from '../tokens';
import { Btn, Signature } from '../ui';
import { Tape } from './Letter';

const center = {
  width: '100%',
  height: '100%',
  position: 'relative' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: sans,
  color: C.plum,
  textAlign: 'center' as const,
  padding: `0 24px ${padBottom(48)}`,
  overflow: 'hidden',
};

const bottomBtn = { position: 'absolute' as const, left: 24, right: 24, bottom: padBottom(48), width: 'auto' };

const shimmer = (gradient: string, size: number) => ({
  fontFamily: serif,
  fontSize: size,
  lineHeight: `${size + 4}px`,
  fontWeight: 600,
  background: gradient,
  backgroundSize: '200% 100%',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  animation: 'k4-shimmer 3s linear infinite',
});

const card = (gold = false) => ({
  position: 'relative' as const,
  width: '100%',
  background: '#fff',
  border: `1px solid ${gold ? 'rgba(228,192,138,.5)' : 'rgba(242,103,154,.18)'}`,
  borderRadius: 24,
  boxShadow: gold ? '0 20px 50px rgba(200,160,90,.25)' : '0 20px 50px rgba(217,76,130,.2)',
  padding: '36px 24px 28px',
  animation: 'k4-rise .6s cubic-bezier(.2,.8,.2,1) both',
});

/* ---------------------------------------------------------- riktig svar */

export function CorrectScreen({
  task,
  view,
  next,
  onBack,
  onGift,
}: {
  task: PublicTask;
  view: TaskView;
  next?: TaskView;
  onBack: () => void;
  onGift: () => void;
}) {
  const s = view.solved!;
  const last = task.id === 10;

  let subline: string | null = null;
  if (next && next.status === 'available') subline = `Brev nr. ${next.id} er på vei til snoren…`;
  if (next && next.status === 'timelocked' && next.unlocksAt) {
    const hhmm = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit' }).format(new Date(next.unlocksAt));
    subline = `Brev nr. ${next.id} leveres kl. ${hhmm}`;
  }

  return (
    <Stage background={last ? 'linear-gradient(180deg,#FFE3EC 0%,#FFF5F7 55%,#FBE7C8 100%)' : G.blush}>
      <div style={center}>
        <Orbs />
        <Confetti count={last ? 40 : 30} seed={last ? 7 : 1} />
        <div style={card(last)}>
          <div style={eyebrow(last ? C.goldText : C.mauve)}>
            Brev nr. {task.id} · {task.title}
          </div>
          {s.route ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {s.route.map((place, i) => (
                <span key={place} style={{ display: 'contents' }}>
                  {i > 0 && <span style={{ color: C.pink }}>✈</span>}
                  <span
                    style={{
                      fontFamily: serif,
                      fontSize: i === s.route!.length - 1 ? 26 : 18,
                      fontWeight: i === s.route!.length - 1 ? 600 : 400,
                      color: i === s.route!.length - 1 ? C.rose : C.plum,
                    }}
                  >
                    {place}
                  </span>
                </span>
              ))}
            </div>
          ) : last ? (
            <div style={{ ...shimmer('linear-gradient(90deg,#CBA36A,#F1D9A8,#E4C08A,#CBA36A)', 52), marginTop: 10 }}>{s.answer}</div>
          ) : (
            <div style={{ fontFamily: serif, fontSize: 40, lineHeight: '44px', fontWeight: 600, marginTop: 10 }}>{s.answer}</div>
          )}
          <div
            style={{
              fontFamily: hand,
              fontSize: last ? 28 : s.route ? 25 : 27,
              lineHeight: last ? '34px' : s.route ? '31px' : '33px',
              marginTop: last ? 18 : s.route ? 20 : 22,
              textWrap: 'pretty',
              textAlign: last ? 'center' : 'left',
            }}
          >
            {s.message}
          </div>
          <Signature />
          <Stamp style={{ right: -10, top: -34 }} />
        </div>

        {last ? (
          <>
            <div style={{ fontFamily: serif, fontSize: 36, lineHeight: '42px', fontWeight: 600, marginTop: 34, textWrap: 'pretty' }}>Alle ti brev er forseglet</div>
            <Btn variant="gold" height={62} shine onClick={onGift} style={{ ...bottomBtn, animation: 'k4-pulse 2s ease-in-out infinite' }}>
              🎁 Åpne gaven
            </Btn>
          </>
        ) : (
          <>
            <div style={{ ...shimmer('linear-gradient(90deg,#D94C82,#F2679A,#D94C82)', 44), marginTop: 34 }}>Riktig!</div>
            {subline && <div style={{ fontSize: 14, lineHeight: '20px', color: C.mauve, marginTop: 8 }}>{subline}</div>}
            <Btn onClick={onBack} shine style={bottomBtn}>
              Tilbake til snoren
            </Btn>
          </>
        )}
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------- bilde sendt */

export function PhotoSentScreen({ task, view, onBack }: { task: PublicTask; view: TaskView; onBack: () => void }) {
  const s = view.solved!;
  return (
    <Stage background={G.blush}>
      <div style={center}>
        <Orbs />
        <Confetti />
        <div
          style={{
            position: 'relative',
            width: 250,
            height: 290,
            background: '#fff',
            padding: '14px 14px 60px',
            boxShadow: '0 24px 50px rgba(217,76,130,.25)',
            transform: 'rotate(-3deg)',
            animation: 'k4-pop .8s cubic-bezier(.2,.9,.3,1.3) both',
          }}
        >
          <Tape width={90} />
          <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg,#E9D3DC 0 8px,#F3E2E8 8px 16px)', overflow: 'hidden' }}>
            {s.photoUrl && <img src={s.photoUrl} alt={task.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ position: 'absolute', left: 14, right: 14, bottom: 16, fontFamily: hand, fontSize: 22, lineHeight: '26px', color: C.plum }}>{task.caption}</div>
          <Stamp size={60} label={null} style={{ right: -16, top: -16, border: '3px solid #fff', animation: 'k4-stamp .6s cubic-bezier(.2,.8,.2,1) .5s both' }} />
        </div>
        <div style={{ fontFamily: serif, fontSize: 32, lineHeight: '38px', fontWeight: 600, marginTop: 40 }}>Frimerket sitter</div>
        <div style={{ fontFamily: hand, fontSize: 28, lineHeight: '34px', marginTop: 14, maxWidth: 320, textWrap: 'pretty' }}>{s.message}</div>
        <div style={{ fontFamily: hand, fontSize: 22, color: C.rose, marginTop: 4 }}>— OP ♥</div>
        <Btn onClick={onBack} style={bottomBtn}>
          Tilbake til snoren
        </Btn>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------ stjerneavsløringen (brev 5) */

export function StarReveal({ view, onDone }: { view: TaskView; onDone: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const s = view.solved!;
  const star = s.star!;

  if (step === 1) {
    return (
      <Stage background={G.blush}>
        <div style={center}>
          <Orbs />
          <Confetti />
          <div style={card()}>
            <div style={eyebrow(C.mauve)}>Brev nr. 5 · Ting jeg er glad i</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
              {star.name.toUpperCase().split('').map((ch, i) => (
                <div
                  key={i}
                  style={{
                    width: 44,
                    height: 56,
                    borderRadius: 12,
                    background: C.blush,
                    border: '1.5px solid rgba(242,103,154,.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: serif,
                    fontSize: 30,
                    fontWeight: 600,
                    color: C.rose,
                    animation: `k4-letterpop .6s cubic-bezier(.2,.8,.2,1) ${0.5 + i * 0.18}s both`,
                  }}
                >
                  {ch}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>siste bokstav i hver setning</div>
            <div style={{ fontFamily: hand, fontSize: 28, lineHeight: '34px', marginTop: 22, textWrap: 'pretty' }}>{s.message}</div>
            <Signature />
            <Stamp style={{ right: -10, top: -34 }} />
          </div>
          <div style={{ ...shimmer('linear-gradient(90deg,#D94C82,#F2679A,#D94C82)', 44), marginTop: 34 }}>Riktig!</div>
          <div style={{ fontSize: 14, lineHeight: '20px', color: C.mauve, marginTop: 8 }}>Men vent — det er noe mer i dette brevet…</div>
          <Btn variant="night" onClick={() => setStep(2)} style={bottomBtn}>
            <span style={{ color: C.gold }}>✦</span>Se opp
          </Btn>
        </div>
      </Stage>
    );
  }

  if (step === 2) {
    return (
      <Stage background={G.night}>
        <div style={{ ...center, justifyContent: 'flex-end', color: C.blush, padding: `0 28px ${padBottom(48)}` }}>
          <Sky />
          <div style={{ position: 'absolute', left: '50%', top: '34%', width: 10, height: 10, margin: -5, borderRadius: '50%', background: '#fff', animation: 'k4-starglow 2s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', left: '50%', top: '34%', width: 120, height: 120, margin: -60, borderRadius: '50%', border: '1px dashed rgba(228,192,138,.5)', animation: 'k4-spin 30s linear infinite' }} />
          <div style={{ position: 'absolute', left: '50%', top: '34%', transform: 'translate(-50%,72px)', fontFamily: hand, fontSize: 24, color: C.gold, whiteSpace: 'nowrap' }}>
            {star.name} ✦ {star.catalog}
          </div>
          <div style={{ position: 'absolute', top: padTop(70, 16), left: 0, right: 0, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,245,247,.5)' }}>
            {star.constellation} · {star.registeredLong}
          </div>
          <div style={{ fontFamily: serif, fontSize: 30, lineHeight: '38px', fontWeight: 500, textWrap: 'pretty', maxWidth: 360, animation: 'k4-rise 1s cubic-bezier(.2,.8,.2,1) both' }}>
            {star.lead} <span style={{ fontStyle: 'italic', color: C.gold }}>{star.name}</span>…
          </div>
          <div style={{ fontFamily: hand, fontSize: 25, lineHeight: '31px', color: 'rgba(255,245,247,.85)', marginTop: 16, maxWidth: 340, textWrap: 'pretty', animation: 'k4-rise 1s cubic-bezier(.2,.8,.2,1) .6s both' }}>
            {star.body}
          </div>
          <Btn variant="gold" onClick={() => setStep(3)} style={{ marginTop: 36, color: C.night, boxShadow: '0 10px 30px rgba(228,192,138,.35)' }}>
            Vis meg stjernen
          </Btn>
        </div>
      </Stage>
    );
  }

  const label = { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, color: C.goldText, fontWeight: 700 };
  const value = { fontFamily: serif, fontSize: 18, marginTop: 2 };
  return (
    <Stage background="radial-gradient(ellipse at 50% 20%,#3D2350 0%,#1E1230 55%,#120A1E 100%)">
      <div style={{ ...center, padding: `0 22px ${padBottom(48)}` }}>
        <Sky />
        <div
          style={{
            width: '100%',
            background: '#FFFDF8',
            borderRadius: 6,
            padding: '30px 24px 26px',
            position: 'relative',
            boxShadow: '0 30px 60px rgba(0,0,0,.5)',
            animation: 'k4-pop .8s cubic-bezier(.2,.9,.3,1.3) both',
            marginBottom: 60,
          }}
        >
          <div style={{ position: 'absolute', inset: 10, border: '1.5px solid #E4C08A', borderRadius: 3, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(228,192,138,.5)', borderRadius: 2, pointerEvents: 'none' }} />
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: C.goldText, fontWeight: 700 }}>Stjernesertifikat</div>
          <div style={{ fontFamily: serif, fontSize: 38, lineHeight: '42px', fontWeight: 500, fontStyle: 'italic', marginTop: 10 }}>{star.name}</div>
          <div style={{ width: 60, height: 1, background: C.gold, margin: '14px auto' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 10px', marginTop: 6, textAlign: 'left' }}>
            <div>
              <div style={label}>Stjernebilde</div>
              <div style={value}>{star.constellation}</div>
            </div>
            <div>
              <div style={label}>Katalog</div>
              <div style={value}>{star.catalog}</div>
            </div>
            <div>
              <div style={label}>Magnitude</div>
              <div style={value}>{star.magnitude}</div>
            </div>
            <div>
              <div style={label}>Registrert</div>
              <div style={value}>{star.registered}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={label}>Posisjon</div>
              <div style={{ ...value, fontSize: 15 }}>
                RA {star.ra} · Dec {star.dec}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, height: 110, borderRadius: 4, background: 'radial-gradient(ellipse at 50% 50%,#2A1A3D,#160E24)', position: 'relative', overflow: 'hidden' }}>
            <Sky n={30} seed={21} big={false} />
            <div style={{ position: 'absolute', left: '58%', top: '44%', width: 8, height: 8, margin: -4, borderRadius: '50%', background: '#fff', animation: 'k4-starglow 2s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', left: '58%', top: '44%', width: 30, height: 30, margin: -15, borderRadius: '50%', border: '1px solid #E4C08A' }} />
            <div style={{ position: 'absolute', left: 10, bottom: 8, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,245,247,.6)' }}>
              {star.constellationLatin} · ♍
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 }}>
            <div style={{ fontFamily: hand, fontSize: 24, color: C.rose, transform: 'rotate(-3deg)' }}>OP</div>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                border: '2px double #E4C08A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.gold,
                fontSize: 22,
                transform: 'rotate(-10deg)',
              }}
            >
              ✦
            </div>
          </div>
        </div>
        <Btn onClick={onDone} style={bottomBtn}>
          Tilbake til snoren
        </Btn>
      </div>
    </Stage>
  );
}
