'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { PublicTask, Tone } from '@/lib/content/public';
import { api, prepareImage, UnsupportedImageError, UploadError, uploadPhoto, type GameState, type TaskView } from '../api';
import { CameraIcon, Eq, FamilyDots, GalleryIcon, LockIcon, Orbs, Shine, Stars } from '../decor';
import { Stage, useVisualViewport } from '../Stage';
import { C, G, hand, padBottom, padTop, sans, serif } from '../tokens';
import { BackButton, Btn } from '../ui';

const TONES: Record<Tone, {
  bg: string;
  back: string;
  backShadow: string;
  border: string;
  shadow: string;
  eyebrow: string;
  line: string;
  label: string;
}> = {
  rose: {
    bg: 'linear-gradient(180deg,#FFF5F7 0%,#FDE7EE 100%)',
    back: G.envPink,
    backShadow: '0 18px 40px rgba(217,76,130,.3)',
    border: 'rgba(242,103,154,.18)',
    shadow: '0 12px 36px rgba(217,76,130,.16)',
    eyebrow: C.rose,
    line: 'rgba(242,103,154,.4)',
    label: C.muted,
  },
  lavender: {
    bg: 'linear-gradient(180deg,#FFF5F7 0%,#F6E7FA 100%)',
    back: 'linear-gradient(160deg,#D7BDF0,#C9A7E8 60%,#B58FDB)',
    backShadow: '0 18px 40px rgba(201,167,232,.4)',
    border: 'rgba(201,167,232,.35)',
    shadow: '0 12px 36px rgba(201,167,232,.25)',
    eyebrow: C.lavText,
    line: 'rgba(201,167,232,.6)',
    label: C.muted,
  },
  gold: {
    bg: 'linear-gradient(180deg,#FFF5F7 0%,#FBE7C8 100%)',
    back: G.gold,
    backShadow: '0 18px 40px rgba(200,160,90,.4)',
    border: 'rgba(228,192,138,.5)',
    shadow: '0 12px 36px rgba(200,160,90,.2)',
    eyebrow: C.goldText,
    line: 'rgba(228,192,138,.7)',
    label: C.goldText,
  },
};

interface LetterProps {
  task: PublicTask;
  view: TaskView;
  offset: number;
  onBack: () => void;
  onState: (s: GameState) => void;
  onSolved: () => void;
}

export default function Letter(props: LetterProps) {
  const { task, view } = props;
  useEffect(() => {
    if (view.status === 'available') api(`/api/tasks/${task.id}/open`, {}).catch(() => {});
  }, [task.id, view.status]);
  return task.kind === 'photo' ? <PhotoLetter {...props} /> : <QuestionLetter {...props} />;
}

/* ------------------------------------------------------------------ ramme */

function Frame({
  task,
  onBack,
  shake,
  children,
  overlay,
}: {
  task: PublicTask;
  onBack: () => void;
  shake?: number;
  children: ReactNode;
  overlay?: ReactNode;
}) {
  const vp = useVisualViewport();
  const tone = TONES[task.tone];
  const gold = task.tone === 'gold';
  const keyboard = vp ? vp.h < window.innerHeight - 120 : false;

  // iOS skyver hele siden opp når tastaturet åpnes — hold den på plass og krymp i stedet.
  useEffect(() => {
    if (keyboard) window.scrollTo(0, 0);
  }, [keyboard, vp?.top]);

  return (
    <Stage background={tone.bg} minHeight={780} visual>
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: sans,
        color: C.plum,
        padding: keyboard ? `${padTop(8, 8)} 16px 12px` : `${padTop(10, 10)} 16px ${padBottom(16)}`,
        overflow: 'hidden',
      }}
    >
      <Orbs />
      {gold && <Stars />}
      <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', position: 'relative', flex: 'none' }}>
        <BackButton onClick={onBack} gold={gold} />
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: gold ? C.goldText : C.mauve, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {gold ? 'Det siste brevet' : `Brev ${task.id} av 10`}
        </div>
        <div style={{ width: 48 }} />
      </div>
      <div style={{ flex: 1, position: 'relative', marginTop: keyboard ? 34 : 34, minHeight: 0 }}>
        {!keyboard && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, borderRadius: '0 0 26px 26px', background: tone.back, boxShadow: tone.backShadow, overflow: 'hidden' }}>
            {gold && <Shine width="40%" opacity={0.5} duration={3.4} />}
          </div>
        )}
        <div
          key={shake}
          style={{
            position: 'absolute',
            left: keyboard ? 0 : 14,
            right: keyboard ? 0 : 14,
            top: 0,
            bottom: keyboard ? 0 : 56,
            background: '#fff',
            border: `1px solid ${tone.border}`,
            borderRadius: 24,
            boxShadow: tone.shadow,
            padding: keyboard ? '34px 22px 18px' : '40px 24px 22px',
            display: 'flex',
            flexDirection: 'column',
            animation: shake ? 'k4-shake .4s ease' : 'k4-rise .7s cubic-bezier(.2,.8,.2,1) both',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -26,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: gold ? 'linear-gradient(135deg,#F98DB4,#F2679A 60%,#E2568A)' : G.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontFamily: serif,
              fontSize: gold ? 22 : 24,
              boxShadow: gold ? '0 6px 16px rgba(217,76,130,.35)' : '0 6px 16px rgba(217,76,130,.25)',
              animation: gold ? 'k4-beat 2s ease-in-out infinite' : undefined,
            }}
          >
            {gold ? '♥' : task.id}
          </div>
          {task.id === 3 && <div style={{ position: 'absolute', top: 26, right: 26, color: C.pink, fontSize: 20, animation: 'k4-peek 3s ease-in-out infinite' }}>♪</div>}
          {task.id === 4 && <div style={{ position: 'absolute', top: 24, right: 26, color: C.gold, fontSize: 22, animation: 'k4-spin 12s linear infinite' }}>☀</div>}
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: tone.eyebrow, fontWeight: 700 }}>{task.eyebrow}</div>
          <div style={{ fontFamily: serif, fontSize: 26, lineHeight: '32px', fontWeight: 600, marginTop: 10 }}>{task.title}</div>
          {children}
        </div>
      </div>
      {overlay}
    </div>
    </Stage>
  );
}

const promptStyle = (size = 27): CSSProperties => ({ fontFamily: hand, fontSize: size, lineHeight: `${size + 6}px`, marginTop: 12, textWrap: 'pretty' });

/* ------------------------------------------------------------ spørsmålsbrev */

function QuestionLetter({ task, view, offset, onBack, onState, onSolved }: LetterProps) {
  const tone = TONES[task.tone];
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [hintNote, setHintNote] = useState(false);
  const [now, setNow] = useState(() => Date.now() + offset);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 5000);
    return () => clearInterval(t);
  }, [offset]);

  const hint = view.hint;
  const hintReady = hint.has1 && (hint.available1 || Boolean(hint.text1) || (hint.available1At !== null && now >= new Date(hint.available1At).getTime()));

  const submit = async () => {
    const v = value.trim();
    if (!v) return inputRef.current?.focus();
    if (busy) return;
    setBusy(true);
    try {
      const res = await api<{ correct: boolean; state: GameState }>(`/api/tasks/${task.id}/answer`, { value: v });
      onState(res.state);
      if (res.correct) {
        inputRef.current?.blur();
        onSolved();
      } else {
        setWrong(v);
        setShake((n) => n + 1);
        navigator.vibrate?.(80);
      }
    } catch {
      setWrong(null);
      setHintNote(false);
      alert('Fikk ikke sendt svaret. Sjekk nettet og prøv igjen.');
    } finally {
      setBusy(false);
    }
  };

  const openHints = async () => {
    if (!hintReady) {
      setHintNote(true);
      return;
    }
    setSheet(true);
    if (!hint.text1) {
      try {
        const res = await api<{ state: GameState }>(`/api/tasks/${task.id}/hint`, {});
        onState(res.state);
      } catch {
        /* arket viser «laster» */
      }
    }
  };

  const openHint2 = async () => {
    const res = await api<{ state: GameState }>(`/api/tasks/${task.id}/hint`, {});
    onState(res.state);
  };

  const isWrong = wrong !== null && value.trim() === wrong;

  return (
    <Frame
      task={task}
      onBack={onBack}
      shake={shake}
      overlay={sheet ? <HintSheet view={view} onClose={() => setSheet(false)} onOpen2={openHint2} /> : null}
    >
      {task.id === 7 ? (
        <>
          <div
            style={{
              marginTop: 18,
              padding: '22px 18px',
              borderRadius: 20,
              background: C.blush,
              border: '1px solid rgba(242,103,154,.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'center',
              flex: 'none',
            }}
          >
            {['🏃‍♀️✈️💨 ⏳⏳⏳', '❌ 🥛', '🛫🛬🛫🛬🛫🛬 🏝️'].map((row) => (
              <div key={row} style={{ fontSize: 30, lineHeight: 1.25, letterSpacing: 2, textAlign: 'center', whiteSpace: 'nowrap' }}>
                {row}
              </div>
            ))}
          </div>
          <div style={{ ...promptStyle(), marginTop: 14, textAlign: 'center' }}>{task.prompt}</div>
          <div style={{ flex: 1, minHeight: 8 }} />
        </>
      ) : task.id === 10 ? (
        <>
          <div style={{ fontFamily: hand, fontSize: 24, lineHeight: '31px', marginTop: 14, textWrap: 'pretty', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {task.prompt.split('\n').map((line, i, all) => (
              <div key={i} style={i === all.length - 1 ? { fontWeight: 700, color: C.rose, marginTop: 4 } : undefined}>
                {line}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 8 }} />
        </>
      ) : task.id === 3 ? (
        <>
          <div style={promptStyle(26)}>
            {task.prompt.split('1:25')[0]}
            <span style={{ color: C.rose, fontWeight: 700 }}>1:25</span>
            {task.prompt.split('1:25')[1]}
          </div>
          <Illustration id={3} />
        </>
      ) : (
        <>
          <div style={promptStyle()}>{task.prompt}</div>
          <Illustration id={task.id} />
        </>
      )}

      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: tone.label, fontWeight: 700, marginBottom: 8, flex: 'none' }}>{task.inputLabel}</div>
      <label
        style={{
          height: 60,
          flex: 'none',
          borderBottom: isWrong ? '2.5px solid #D94C82' : `2px solid ${tone.line}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 4px',
        }}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={task.placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="send"
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            fontFamily: hand,
            fontSize: 28,
            color: C.plum,
            textDecorationLine: isWrong ? 'line-through' : 'none',
            textDecorationColor: C.rose,
            textDecorationThickness: 2,
          }}
        />
        {isWrong && <span style={{ fontFamily: hand, fontSize: 20, color: C.rose }}>✗</span>}
      </label>
      {isWrong && (
        <div style={{ fontFamily: hand, fontSize: 22, lineHeight: '26px', color: C.rose, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
          ikke helt — prøv igjen <span style={{ display: 'inline-block', animation: 'k4-beat 1.6s ease-in-out infinite' }}>♥</span>
        </div>
      )}
      <Btn shine={!isWrong} onClick={submit} disabled={busy} style={{ marginTop: isWrong ? 12 : 20 }}>
        {busy ? 'Forsegler…' : 'Forsegle svaret'}
      </Btn>
      {hint.has1 &&
        (hintReady ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, flex: 'none' }}>
            <button
              type="button"
              className="tap"
              onClick={openHints}
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                background: C.lilac,
                border: '1px solid rgba(201,167,232,.5)',
                fontFamily: hand,
                fontSize: 20,
                color: C.lavText,
                fontWeight: 700,
                animation: 'k4-pop .5s cubic-bezier(.2,.9,.3,1.3) both',
              }}
            >
              {hint.text1 ? 'P.S. — les lappen igjen ✦' : 'P.S. — en lapp bak brevet ✦'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openHints}
            style={{ textAlign: 'center', fontFamily: hand, fontSize: 20, color: C.mauve, marginTop: 14, opacity: hintNote ? 0.8 : 0.45, flex: 'none' }}
          >
            {hintNote ? 'lappen dukker opp etter to forsøk, eller om litt ♥' : 'P.S. — trenger du et hint?'}
          </button>
        ))}
    </Frame>
  );
}

function HintSheet({ view, onClose, onOpen2 }: { view: TaskView; onClose: () => void; onOpen2: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const { hint } = view;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(74,34,51,.35)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', animation: 'k4-fade .25s ease both' }}
      />
      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: padBottom(24),
          animation: 'k4-rise .6s cubic-bezier(.2,.8,.2,1) both',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ background: C.lilac, borderRadius: '6px 6px 22px 22px', padding: '26px 26px 22px', boxShadow: '0 20px 50px rgba(74,34,51,.3)', position: 'relative', transform: 'rotate(-1.5deg)' }}>
          <Tape />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: C.lavText, fontStyle: 'italic' }}>P.S.</div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.lavText, fontWeight: 700 }}>hint 1</div>
          </div>
          <div style={{ fontFamily: hand, fontSize: 30, lineHeight: '36px', marginTop: 8, textWrap: 'pretty', color: C.plum }}>{hint.text1 ?? '…'}</div>
        </div>

        {hint.has2 &&
          (hint.text2 ? (
            <div style={{ background: '#fff', borderRadius: '6px 6px 22px 22px', padding: '22px 26px', boxShadow: '0 20px 50px rgba(74,34,51,.25)', position: 'relative', transform: 'rotate(1deg)', animation: 'k4-pop .5s cubic-bezier(.2,.9,.3,1.3) both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: C.rose, fontStyle: 'italic' }}>P.P.S.</div>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.rose, fontWeight: 700 }}>hint 2</div>
              </div>
              <div style={{ fontFamily: hand, fontSize: 28, lineHeight: '32px', marginTop: 4, color: C.plum }}>{hint.text2}</div>
            </div>
          ) : (
            <button
              type="button"
              disabled={!hint.available2 || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onOpen2();
                } finally {
                  setBusy(false);
                }
              }}
              style={{
                background: '#fff',
                border: '1.5px dashed rgba(201,167,232,.7)',
                borderRadius: '6px 6px 22px 22px',
                padding: '20px 26px',
                position: 'relative',
                transform: 'rotate(1deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                textAlign: 'left',
                cursor: hint.available2 ? 'pointer' : 'default',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: C.muted, fontStyle: 'italic' }}>P.P.S.</div>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.muted, fontWeight: 700 }}>hint 2</div>
                </div>
                <div style={{ fontFamily: hand, fontSize: 22, lineHeight: '26px', marginTop: 4, color: C.muted }}>
                  {hint.available2 ? (busy ? 'åpner…' : 'trykk for å åpne lappen') : '· · · · · · · · ·'}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: hint.available2 ? C.pink : C.gold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none',
                  color: '#fff',
                  animation: hint.available2 ? 'k4-beat 1.6s ease-in-out infinite' : undefined,
                }}
              >
                {hint.available2 ? '✦' : <LockIcon w={14} h={16} />}
              </div>
            </button>
          ))}
        {hint.has2 && !hint.text2 && !hint.available2 && (
          <div style={{ fontSize: 12, color: C.blush, textAlign: 'center', opacity: 0.85 }}>Hint 2 åpner etter ett forsøk til</div>
        )}
        <Btn onClick={onClose}>Ok, jeg prøver igjen</Btn>
      </div>
    </div>
  );
}

export function Tape({ width = 100 }: { width?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -14,
        left: '50%',
        transform: 'translateX(-50%) rotate(2deg)',
        width,
        height: 28,
        background: 'rgba(228,192,138,.75)',
        backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,.4) 0 6px,transparent 6px 12px)',
      }}
    />
  );
}

/* -------------------------------------------------------------- bildebrev */

function PhotoLetter({ task, onBack, onState, onSolved }: LetterProps) {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pick = () => inputRef.current?.click();

  // Gjør bildet klart med en gang (også HEIC fra iPhone), så forhåndsvisningen virker overalt.
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setError(null);
    setPreparing(true);
    try {
      const prepared = await prepareImage(f);
      setPhoto(prepared);
      setPreview(URL.createObjectURL(prepared));
    } catch (e) {
      console.error(e);
      setError(
        e instanceof UnsupportedImageError ? 'dette bildeformatet kan ikke leses — prøv et annet bilde ♥' : 'fikk ikke lest bildet — prøv igjen ♥',
      );
    } finally {
      setPreparing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const submit = async () => {
    if (!photo || busy) return;
    setBusy(true);
    setError(null);
    try {
      onState(await uploadPhoto(task.id, photo));
      onSolved();
    } catch (e) {
      console.error(e);
      setError(`fikk ikke limt på frimerket — prøv igjen ♥${e instanceof UploadError ? ` (${e.message})` : ''}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame task={task} onBack={onBack}>
      <div style={promptStyle(task.id === 9 ? 25 : task.id === 8 ? 26 : 27)}>{task.prompt}</div>
      <input ref={inputRef} type="file" accept="image/*,.heic,.heif" className="visually-hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <div style={{ flex: 1, minHeight: 0, marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {preview ? (
          <button type="button" onClick={pick} className="tap" style={{ position: 'relative', height: '100%', maxHeight: 250, aspectRatio: '4 / 5', maxWidth: '80%' }}>
            <div style={{ width: '100%', height: '100%', padding: '10px 10px 34px', background: '#fff', boxShadow: '0 16px 36px rgba(201,167,232,.35)', transform: 'rotate(-3deg)', borderRadius: 4, animation: 'k4-pop .6s cubic-bezier(.2,.9,.3,1.3) both' }}>
              <img src={preview} alt="Bildet ditt" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 6, fontFamily: hand, fontSize: 18, color: C.muted, textAlign: 'center' }}>trykk for å bytte</div>
            </div>
          </button>
        ) : (
          <PhotoPlaceholder task={task} onPick={pick} />
        )}
      </div>
      {error && <div style={{ fontFamily: hand, fontSize: 21, color: C.rose, textAlign: 'center', marginTop: 8, flex: 'none' }}>{error}</div>}
      {preparing ? (
        <Btn variant="muted" disabled style={{ marginTop: 14 }}>
          Gjør klar bildet…
        </Btn>
      ) : photo ? (
        <Btn variant="lav" shine={!busy} onClick={submit} disabled={busy} style={{ marginTop: 14 }}>
          {busy ? 'Limer på frimerket…' : 'Lim på frimerket'}
        </Btn>
      ) : task.pickCta ? (
        <Btn variant="lav" onClick={pick} style={{ marginTop: 14 }}>
          {task.pickCta}
        </Btn>
      ) : (
        <Btn variant="muted" onClick={pick} style={{ marginTop: 14 }}>
          Lim på frimerket
        </Btn>
      )}
    </Frame>
  );
}

const dashedBox = (w: number, h: number, rotate: number): CSSProperties => ({
  width: w,
  height: h,
  padding: 10,
  background: '#fff',
  boxShadow: '0 12px 30px rgba(201,167,232,.3)',
  transform: `rotate(${rotate}deg)`,
  borderRadius: 4,
  position: 'relative',
  border: '2px dashed rgba(201,167,232,.7)',
  zIndex: 2,
});

const innerBox: CSSProperties = {
  width: '100%',
  height: '100%',
  background: C.lilac,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const iconCircle = (size: number, animation: string): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 20px rgba(201,167,232,.3)',
  animation,
});

function PhotoPlaceholder({ task, onPick }: { task: PublicTask; onPick: () => void }) {
  const title = <div style={{ fontSize: 15, fontWeight: 700, color: C.lavText }}>{task.uploadTitle}</div>;
  const sub = task.uploadSub ? <div style={{ fontSize: 12, color: C.mauve }}>{task.uploadSub}</div> : null;
  return (
    <button type="button" onClick={onPick} className="tap" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {task.id === 2 && (
        <>
          <div style={dashedBox(190, 190, -3)}>
            <div style={innerBox}>
              <div style={iconCircle(64, 'k4-pulse 2.4s ease-in-out infinite')}>
                <CameraIcon />
              </div>
              {title}
              {sub}
            </div>
          </div>
          <div style={{ position: 'absolute', right: 6, bottom: 6, fontFamily: hand, fontSize: 20, color: C.muted, transform: 'rotate(-8deg)', zIndex: 3 }}>dere to ↑</div>
        </>
      )}
      {task.id === 4 && (
        <>
          <div style={{ position: 'absolute', width: 150, height: 150, background: '#fff', padding: 8, boxShadow: '0 8px 20px rgba(201,167,232,.2)', transform: 'rotate(9deg) translate(70px,-10px)', opacity: 0.6 }}>
            <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg,#F1E1BE 0 6px,#F7ECD2 6px 12px)' }} />
          </div>
          <div style={{ position: 'absolute', width: 150, height: 150, background: '#fff', padding: 8, boxShadow: '0 8px 20px rgba(201,167,232,.2)', transform: 'rotate(-11deg) translate(-70px,-4px)', opacity: 0.6 }}>
            <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg,#C8D3C0 0 6px,#DDE4D6 6px 12px)' }} />
          </div>
          <div style={dashedBox(180, 180, 0)}>
            <div style={innerBox}>
              <div style={iconCircle(60, 'k4-pulse 2.4s ease-in-out infinite')}>
                <GalleryIcon />
              </div>
              {title}
              {sub}
            </div>
          </div>
        </>
      )}
      {task.id === 6 && (
        <div style={dashedBox(200, 170, 2)}>
          <div style={{ ...innerBox, gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 0.5].map((d) => (
                <div key={d} style={{ ...iconCircle(40, `k4-peek 2s ease-in-out ${d}s infinite`), fontSize: 20, boxShadow: '0 6px 14px rgba(201,167,232,.3)' }}>
                  😊
                </div>
              ))}
            </div>
            <div style={{ marginTop: 4 }}>{title}</div>
            {sub}
          </div>
        </div>
      )}
      {task.id === 8 && (
        <>
          <div style={{ ...dashedBox(200, 150, -6), marginTop: 6 }}>
            <div style={{ ...innerBox, gap: 6 }}>
              <div style={iconCircle(56, 'k4-wobble 1.6s ease-in-out infinite')}>
                <CameraIcon size={26} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.lavText }}>{task.uploadTitle}</div>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              padding: '8px 14px',
              borderRadius: 999,
              background: '#fff',
              border: '1px solid rgba(201,167,232,.5)',
              fontFamily: hand,
              fontSize: 20,
              color: C.lavText,
              transform: 'rotate(4deg)',
              boxShadow: '0 6px 14px rgba(201,167,232,.2)',
              zIndex: 3,
            }}
          >
            skjevt er lov ♥
          </div>
        </>
      )}
      {task.id === 9 && (
        <div style={dashedBox(240, 140, -2)}>
          <div style={{ ...innerBox, gap: 6 }}>
            <FamilyDots />
            <div style={{ fontSize: 14, fontWeight: 700, color: C.lavText, marginTop: 4 }}>{task.uploadTitle}</div>
            {sub}
          </div>
        </div>
      )}
    </button>
  );
}

/* --------------------------------------------------------- illustrasjoner */

function Illustration({ id }: { id: number }) {
  const wrap: CSSProperties = { flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' };
  if (id === 1) {
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 44 }}>
          <div style={{ width: 110, height: 64, borderRadius: '0 0 55px 55px', background: 'linear-gradient(180deg,#FDE7EE,#F6D2DE)', position: 'relative', boxShadow: '0 8px 20px rgba(217,76,130,.15)' }}>
            <div style={{ position: 'absolute', left: 14, right: 14, top: -6, height: 14, borderRadius: '50%', background: C.blush, border: '2px solid #F6D2DE' }} />
            {[
              [30, -38, 34, '2s', '0s'],
              [52, -44, 40, '2.4s', '.4s'],
              [74, -36, 32, '2.2s', '.8s'],
            ].map(([l, t, h, dur, delay]) => (
              <div
                key={String(l)}
                style={{
                  position: 'absolute',
                  left: Number(l),
                  top: Number(t),
                  width: 2,
                  height: Number(h),
                  background: 'linear-gradient(180deg,rgba(242,103,154,0),rgba(242,103,154,.35))',
                  borderRadius: 2,
                  animation: `k4-peek ${dur} ease-in-out ${delay} infinite`,
                }}
              />
            ))}
          </div>
          <div style={{ fontFamily: hand, fontSize: 20, color: C.muted, transform: 'rotate(-6deg)', marginBottom: 10 }}>noe varmt…</div>
        </div>
      </div>
    );
  }
  if (id === 3) {
    return (
      <div style={{ ...wrap, gap: 18, marginTop: 10 }}>
        <div
          style={{
            width: 110,
            height: 110,
            flex: 'none',
            borderRadius: '50%',
            background: 'repeating-radial-gradient(circle,#4A2233 0 1.5px,#5E3548 1.5px 3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'k4-spin 8s linear infinite',
            boxShadow: '0 12px 24px rgba(74,34,51,.25)',
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: serif, fontSize: 20 }}>?</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontFamily: hand, fontSize: 22, color: C.mauve, lineHeight: '24px' }}>du vet hvilken</div>
          <div
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              background: C.blush,
              border: '1px solid rgba(242,103,154,.3)',
              fontFamily: serif,
              fontSize: 22,
              fontWeight: 600,
              color: C.rose,
              fontVariantNumeric: 'tabular-nums',
              width: 'fit-content',
            }}
          >
            1:25
          </div>
          <Eq />
        </div>
      </div>
    );
  }
  if (id === 5) {
    return (
      <div style={wrap}>
        <div
          style={{
            position: 'relative',
            width: 200,
            height: 130,
            background: C.blush,
            border: '1px solid rgba(242,103,154,.25)',
            borderRadius: 6,
            boxShadow: '0 12px 28px rgba(217,76,130,.15)',
            padding: '14px 16px',
            animation: 'k4-sway 5s ease-in-out infinite',
            transformOrigin: '50% 200%',
          }}
        >
          <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: C.plum }}>Ting jeg er glad i</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['90%', '70%', '85%', '60%'].map((w) => (
              <div key={w} style={{ height: 2, width: w, background: 'rgba(242,103,154,.25)', borderRadius: 2 }} />
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              right: -14,
              bottom: -14,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#fff',
              border: '1px solid rgba(242,103,154,.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 6px 14px rgba(217,76,130,.15)',
            }}
          >
            👩‍🦰
          </div>
        </div>
        <div style={{ position: 'absolute', left: 4, top: 6, fontFamily: hand, fontSize: 20, color: C.muted, transform: 'rotate(-6deg)' }}>kortet har mamma</div>
      </div>
    );
  }
  return <div style={{ flex: 1 }} />;
}
