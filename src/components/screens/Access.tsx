'use client';

import { useRef, useState } from 'react';
import { api, HttpError } from '../api';
import { BigLockIcon, Orbs, Stars } from '../decor';
import { Stage } from '../Stage';
import { C, G, hand, padBottom, padTop, sans, serif } from '../tokens';
import { Btn } from '../ui';

// 00 · Tilgang — fødselsdatoen (18 09 94) bryter seglet
export default function Access({ onSuccess }: { onSuccess: () => void }) {
  const [digits, setDigits] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (code: string) => {
    if (busy || code.length !== 6) return;
    setBusy(true);
    try {
      await api('/api/auth', { code });
      inputRef.current?.blur();
      setOpened(true);
      setTimeout(onSuccess, 900);
    } catch (e) {
      setError(true);
      setShake((n) => n + 1);
      setDigits('');
      if (!(e instanceof HttpError)) console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const onChange = (raw: string) => {
    const next = raw.replace(/\D/g, '').slice(0, 6);
    setDigits(next);
    setError(false);
    if (next.length === 6) submit(next);
  };

  const focus = () => inputRef.current?.focus();

  return (
    <Stage background={G.blush} minHeight={760}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: sans,
          color: C.plum,
          textAlign: 'center',
          padding: `${padTop(110, 40)} 24px ${padBottom(48)}`,
          overflow: 'hidden',
        }}
      >
        <Orbs />
        <Stars />
        <div style={{ position: 'relative', width: 240, height: 160, animation: 'k4-sway 4s ease-in-out infinite', transformOrigin: '50% -40px' }}>
          <div style={{ position: 'absolute', top: -40, left: '50%', width: 2, height: 44, marginLeft: -1, background: C.rose }} />
          <div style={{ position: 'absolute', top: -6, left: '50%', width: 18, height: 30, marginLeft: -9, background: G.goldTape, borderRadius: 4, zIndex: 3 }} />
          <div style={{ position: 'absolute', inset: 0, background: G.envPink, borderRadius: 16, boxShadow: '0 18px 40px rgba(217,76,130,.35)' }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: G.flapPink,
              clipPath: opened ? 'polygon(0 0,50% 0,100% 0)' : 'polygon(0 0,50% 62%,100% 0)',
              borderRadius: '16px 16px 0 0',
              transition: 'clip-path .6s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 78,
              transform: `translate(-50%,-50%) scale(${opened ? 1.25 : 1})`,
              width: 66,
              height: 66,
              borderRadius: '50%',
              background: G.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,.18),inset 0 2px 4px rgba(255,255,255,.6)',
              animation: opened ? 'k4-burst .8s ease-out .2s both' : 'k4-beat 2.2s ease-in-out infinite',
              color: '#fff',
              fontSize: 30,
            }}
          >
            {opened ? '♥' : <BigLockIcon />}
          </div>
        </div>

        <div style={{ fontSize: 12, lineHeight: '16px', letterSpacing: 3, textTransform: 'uppercase', color: C.rose, fontWeight: 700, marginTop: 44, whiteSpace: 'nowrap' }}>
          Forseglet · bare for Regine
        </div>
        <div style={{ fontFamily: serif, fontSize: 32, lineHeight: '38px', fontWeight: 500, marginTop: 10 }}>
          Hvilken dato ble <span style={{ fontStyle: 'italic', color: C.rose }}>du</span> født?
        </div>
        <div style={{ fontFamily: hand, fontSize: 24, lineHeight: '28px', color: C.mauve, marginTop: 8, transform: 'rotate(-1.5deg)' }}>
          {error ? 'ikke helt — prøv igjen ♥' : 'fødselsdagen din bryter seglet — OP'}
        </div>

        <div
          key={shake}
          onClick={focus}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            marginTop: 32,
            position: 'relative',
            animation: shake ? 'k4-shake .4s ease' : undefined,
          }}
        >
          {Array.from({ length: 6 }, (_, i) => {
            const d = digits[i];
            const active = i === digits.length && !opened;
            return (
              <div
                key={i}
                style={{
                  width: 46,
                  height: 60,
                  borderRadius: 16,
                  background: '#fff',
                  border: active ? '2px solid #F2679A' : error ? '1.5px solid #D94C82' : '1.5px solid rgba(242,103,154,.3)',
                  boxShadow: active ? '0 0 0 4px rgba(242,103,154,.15), 0 8px 24px rgba(217,76,130,.12)' : '0 8px 24px rgba(217,76,130,.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: serif,
                  fontSize: 30,
                  fontWeight: 500,
                  color: C.plum,
                  marginLeft: i === 2 || i === 4 ? 10 : 0,
                }}
              >
                {d ?? (active ? <div style={{ width: 2, height: 30, background: C.pink, animation: 'k4-twinkle 1s ease-in-out infinite' }} /> : '')}
              </div>
            );
          })}
          <input
            ref={inputRef}
            aria-label="Fødselsdato, seks sifre"
            value={digits}
            onChange={(e) => onChange(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={6}
            style={{ position: 'absolute', inset: 0, opacity: 0, fontSize: 16, color: 'transparent', caretColor: 'transparent' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, fontSize: 11, lineHeight: '16px', letterSpacing: 2, color: C.muted, textTransform: 'uppercase' }}>
          <span style={{ width: 98 }}>dag</span>
          <span style={{ width: 108 }}>måned</span>
          <span style={{ width: 108 }}>år</span>
        </div>

        <div style={{ flex: 1 }} />
        <Btn shine onClick={() => (digits.length === 6 ? submit(digits) : focus())} disabled={busy}>
          {busy ? 'Bryter seglet…' : 'Bryt seglet'}
        </Btn>
      </div>
    </Stage>
  );
}
