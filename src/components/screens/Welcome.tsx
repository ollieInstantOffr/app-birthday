'use client';

import { useState } from 'react';
import { eventDayLabel } from '../api';
import { Orbs, Shine, Stars } from '../decor';
import { Stage } from '../Stage';
import { C, G, hand, padBottom, sans } from '../tokens';
import { Btn } from '../ui';

// 02 · Velkomst — hilsen fra OP
export default function Welcome({ eventDate, onContinue }: { eventDate: string; onContinue: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Stage background="linear-gradient(180deg,#FFF5F7 0%,#FDE7EE 100%)" minHeight={860}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: sans,
          color: C.plum,
          padding: `0 24px ${padBottom(48)}`,
          overflow: 'hidden',
        }}
      >
        <Orbs />
        <Stars />
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: 150, height: 140, background: 'linear-gradient(180deg,#FDE7EE,#FFF5F7)', border: '1px solid rgba(242,103,154,.18)', borderTop: 'none', borderRadius: '0 0 22px 22px' }} />
          <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: 290, height: 120, background: 'linear-gradient(180deg,#FFF5F7,#FDE7EE)', border: '1px solid rgba(242,103,154,.18)', borderBottom: 'none', clipPath: 'polygon(0 100%,100% 100%,50% 0)' }} />
          <div
            style={{
              position: 'absolute',
              left: '11%',
              right: '11%',
              bottom: 170,
              background: '#fff',
              border: '1px solid rgba(242,103,154,.18)',
              borderRadius: 24,
              boxShadow: '0 12px 36px rgba(217,76,130,.16)',
              padding: '34px 24px 82px',
              animation: 'k4-letterup 3.5s cubic-bezier(.2,.8,.2,1) both',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -24,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#F98DB4,#F2679A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
                boxShadow: '0 6px 16px rgba(217,76,130,.3)',
              }}
            >
              ♥
            </div>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: C.rose, fontWeight: 700 }}>
              {eventDayLabel(eventDate)} · kl. 07:00
            </div>
            <div style={{ fontFamily: hand, fontSize: 28, lineHeight: '34px', fontWeight: 500, marginTop: 10, textWrap: 'pretty' }}>
              Kjære Regine,
              <br />i dag fyller du 32, og jeg har skrevet ti brev til deg. De henger på en snor og kommer ett og ett gjennom dagen — noen med en gåte, noen ber om et bilde. Og når det siste er åpnet, venter en overraskelse.
            </div>
            <div style={{ fontFamily: hand, fontSize: 28, color: C.rose, marginTop: 10, textAlign: 'right', fontWeight: 700 }}>— OP ♥</div>
          </div>
          <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: 50, height: 160, borderRadius: 22, background: G.envPink, boxShadow: '0 18px 40px rgba(217,76,130,.3)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: G.flapPink, clipPath: 'polygon(0 0,50% 58%,100% 0)' }} />
            <Shine opacity={0.3} duration={4} />
          </div>
        </div>
        <Btn
          shine
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onContinue();
            } finally {
              setBusy(false);
            }
          }}
        >
          Heng opp snoren
        </Btn>
      </div>
    </Stage>
  );
}
