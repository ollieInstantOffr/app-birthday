'use client';

import type { CSSProperties, ReactNode } from 'react';
import { BackIcon, Shine } from './decor';
import { C, G, hand } from './tokens';

type Variant = 'pink' | 'gold' | 'lav' | 'muted' | 'night' | 'outlineGold';

const VARIANTS: Record<Variant, CSSProperties> = {
  pink: { background: G.pinkBtn, color: '#fff', boxShadow: '0 10px 30px rgba(217,76,130,.35),inset 0 1px 0 rgba(255,255,255,.35)' },
  gold: { background: G.gold, color: C.plum, boxShadow: '0 12px 34px rgba(200,160,90,.45)' },
  lav: { background: G.lavBtn, color: '#fff', boxShadow: '0 10px 30px rgba(201,167,232,.4)' },
  muted: { background: C.lilac, color: C.muted },
  night: { background: C.night, color: C.blush, boxShadow: '0 10px 30px rgba(59,27,41,.35)' },
  outlineGold: { background: '#fff', border: '1.5px solid rgba(228,192,138,.8)', color: C.goldText, boxShadow: '0 10px 30px rgba(200,160,90,.2)' },
};

export function Btn({
  children,
  onClick,
  variant = 'pink',
  disabled,
  shine = false,
  height = 58,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  shine?: boolean;
  height?: number;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className="tap"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        height,
        flex: 'none',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: height > 58 ? 18 : 17,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
        opacity: disabled ? 0.7 : 1,
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {shine && <Shine />}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>{children}</span>
    </button>
  );
}

export function BackButton({ onClick, gold = false }: { onClick: () => void; gold?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Tilbake til snoren"
      className="tap"
      onClick={onClick}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: '#fff',
        border: `1px solid ${gold ? 'rgba(228,192,138,.5)' : 'rgba(242,103,154,.18)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: gold ? '0 6px 18px rgba(200,160,90,.15)' : '0 6px 18px rgba(217,76,130,.1)',
      }}
    >
      <BackIcon />
    </button>
  );
}

/** Bjella som slår på push-varsler. Vises bare når varsler kan slås på. */
export function PushBell({ onClick, style }: { onClick: () => void; style?: CSSProperties }) {
  return (
    <button
      type="button"
      aria-label="Få varsel når neste brev kommer"
      className="tap"
      onClick={onClick}
      style={{
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#fff',
        border: '1px solid rgba(242,103,154,.25)',
        boxShadow: '0 6px 18px rgba(217,76,130,.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 6,
        ...style,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A2233" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <span
        style={{
          position: 'absolute',
          top: 8,
          right: 9,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: C.pink,
          border: '2px solid #fff',
          animation: 'k4-beat 1.6s ease-in-out infinite',
        }}
      />
    </button>
  );
}

export function Signature({ size = 26, style }: { size?: number; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: hand, fontSize: size, color: C.rose, marginTop: 6, textAlign: 'right', fontWeight: 700, ...style }}>
      — OP ♥
    </div>
  );
}
