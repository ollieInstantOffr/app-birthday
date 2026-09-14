'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCountdown } from '../api';
import { LockIcon, Orbs, Stars } from '../decor';
import { Stage } from '../Stage';
import type { PushStatus } from '../push';
import { C, G, hand, padBottom, padTop, sans, serif } from '../tokens';
import { PushBell } from '../ui';

// 01 · Låst — brev 1 leveres 07:00
export default function Countdown({
  target,
  offset,
  onDone,
  push,
}: {
  target: string;
  offset: number;
  onDone: () => void;
  push?: { visible: boolean; enable: () => Promise<PushStatus> };
}) {
  const [now, setNow] = useState(() => Date.now() + offset);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(t);
  }, [offset]);

  const remaining = new Date(target).getTime() - now;
  useEffect(() => {
    if (remaining <= 0 && !done.current) {
      done.current = true;
      onDone();
    }
  }, [remaining, onDone]);

  return (
    <Stage background={G.blush} minHeight={720}>
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
          padding: `${padTop(40)} 24px ${padBottom(40)}`,
          overflow: 'hidden',
        }}
      >
        <Orbs />
        <Stars />
        {push?.visible && (
          <PushBell
            style={{ top: padTop(24, 8), right: 14 }}
            onClick={async () => {
              const result = await push.enable();
              setPushMessage(
                result === 'granted'
                  ? 'Du får et varsel når det første brevet kommer ♥'
                  : result === 'denied'
                    ? 'varsler er slått av i innstillingene'
                    : 'fikk ikke slått på varsler',
              );
            }}
          />
        )}
        <div style={{ flex: 1 }} />

        {/* Snoren og brev nr. 1 */}
        <div style={{ position: 'relative', alignSelf: 'stretch', height: 180, flex: 'none' }}>
          <svg
            viewBox="0 0 440 120"
            preserveAspectRatio="none"
            style={{ position: 'absolute', left: -24, top: 0, width: 'calc(100% + 48px)', height: 120 }}
            fill="none"
          >
            <path d="M-10 40 Q220 110 450 40" stroke="#D94C82" strokeWidth="2" />
          </svg>
          <div style={{ position: 'absolute', top: 46, left: '50%', width: 150, height: 104, marginLeft: -75, animation: 'k4-sway 4.4s ease-in-out infinite', transformOrigin: '50% -10px' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', width: 14, height: 28, marginLeft: -7, background: G.goldTape, borderRadius: 3, zIndex: 3 }} />
            <div style={{ position: 'absolute', inset: 0, background: '#FDE7EE', border: '1px solid rgba(242,103,154,.25)', borderRadius: 12, boxShadow: '0 12px 30px rgba(217,76,130,.15)' }} />
            <div style={{ position: 'absolute', inset: 0, background: '#FFF0F4', clipPath: 'polygon(0 0,50% 60%,100% 0)', borderRadius: '12px 12px 0 0' }} />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 52,
                transform: 'translate(-50%,-50%)',
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: G.gold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 14px rgba(200,160,90,.4)',
              }}
            >
              <LockIcon w={14} h={16} />
            </div>
            <div style={{ position: 'absolute', left: '50%', bottom: -30, transform: 'translateX(-50%)', fontFamily: hand, fontSize: 20, color: C.muted, whiteSpace: 'nowrap' }}>
              brev nr. 1 · Der det begynte
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, fontFamily: serif, fontSize: 36, lineHeight: '42px', fontWeight: 500, textWrap: 'pretty', position: 'relative' }}>
          Gratulerer med dagen, <span style={{ fontStyle: 'italic', color: C.rose }}>Regine</span>
        </div>
        <div style={{ fontSize: 17, lineHeight: '26px', color: C.mauve, marginTop: 14, position: 'relative' }}>Første brev leveres klokken 07:00</div>
        <div
          style={{
            marginTop: 26,
            padding: '14px 28px',
            borderRadius: 999,
            background: 'rgba(255,255,255,.7)',
            border: '1px solid rgba(242,103,154,.18)',
            boxShadow: '0 8px 28px rgba(217,76,130,.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontFamily: serif,
            fontSize: 42,
            lineHeight: '46px',
            fontWeight: 500,
            color: C.rose,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: 1,
            whiteSpace: 'nowrap',
            position: 'relative',
          }}
        >
          {formatCountdown(remaining)}
        </div>
        {pushMessage && (
          <div style={{ fontFamily: hand, fontSize: 22, color: C.rose, marginTop: 14, position: 'relative', animation: 'k4-rise .4s ease both' }}>{pushMessage}</div>
        )}

        <div style={{ flex: 1.3 }} />
        <div style={{ color: C.pink, fontSize: 18, animation: 'k4-beat 1.8s ease-in-out infinite', position: 'relative' }}>♥</div>
      </div>
    </Stage>
  );
}
