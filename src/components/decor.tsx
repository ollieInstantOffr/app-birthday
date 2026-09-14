'use client';

import type { CSSProperties } from 'react';
import { serif } from './tokens';

// Pseudo-tilfeldig og deterministisk, samme formel som i designet.
export const rnd = (i: number, seed: number) => ((i * 9301 + seed * 49297) % 233280) / 233280;

const fill: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' };

export function Orbs() {
  const cfg: [number, number, number, string][] = [
    [-60, -40, 260, '#FFD3E1'],
    [260, 120, 220, '#E9D8F7'],
    [-40, 520, 240, '#FBE7C8'],
    [240, 700, 260, '#FFD3E1'],
  ];
  return (
    <div style={fill}>
      {cfg.map(([x, y, sz, c], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: sz,
            height: sz,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c} 0%, rgba(255,255,255,0) 70%)`,
            opacity: 0.8,
            animation: `k4-drift ${14 + i * 3}s ease-in-out ${-i * 4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

const STARS: [number, number, string, number][] = [
  [12, 14, '#E4C08A', 16],
  [82, 10, '#C9A7E8', 12],
  [90, 30, '#F2679A', 10],
  [8, 44, '#C9A7E8', 11],
  [88, 58, '#E4C08A', 13],
  [14, 72, '#F2679A', 12],
  [78, 84, '#C9A7E8', 10],
  [50, 92, '#E4C08A', 9],
];

export function Stars({ dark = false }: { dark?: boolean }) {
  return (
    <div style={fill}>
      {STARS.map(([x, y, c, fs], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            color: dark ? (i % 2 ? '#E4C08A' : 'rgba(255,245,247,.7)') : c,
            fontSize: fs,
            lineHeight: 1,
            fontFamily: serif,
            animation: `k4-twinkle ${2 + rnd(i, 3) * 2}s ease-in-out ${-rnd(i, 5) * 3}s infinite`,
          }}
        >
          {i % 3 === 2 ? '♥' : '✦'}
        </div>
      ))}
    </div>
  );
}

export function Confetti({ count = 30, seed = 1 }: { count?: number; seed?: number }) {
  const cols = ['#F2679A', '#E4C08A', '#C9A7E8', '#FDE7EE'];
  return (
    <div style={fill}>
      {Array.from({ length: count }, (_, i) => {
        const r = rnd(i, seed);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i / count) * 100}%`,
              top: 0,
              width: 8 + (i % 3) * 3,
              height: 12 + (i % 4) * 3,
              borderRadius: i % 2 ? '50%' : 3,
              background: cols[i % 4],
              animation: `k4-fall ${3 + r * 2.5}s linear ${-r * 4}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

// rnd() gir verdier som vokser jevnt med i — fint til animasjonsforsinkelser, men stjerner
// plassert med den havner på diagonale linjer. Posisjonene bruker derfor en ekte hash.
const hash = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function Sky({ n = 70, seed = 11, big = true }: { n?: number; seed?: number; big?: boolean }) {
  return (
    <div style={fill}>
      {Array.from({ length: n }, (_, i) => {
        const size = big ? 1 + (i % 3) : 1 + (i % 2);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${hash(i, seed) * 100}%`,
              top: `${hash(i, seed + 1) * 100}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 7 === 0 ? '#E4C08A' : '#fff',
              opacity: 0.4 + rnd(i, seed + 2) * 0.6,
              animation: `k4-glow ${2 + rnd(i, seed + 3) * 3}s ease-in-out ${-rnd(i, seed + 4) * 3}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

export function Eq({ color = '#F2679A' }: { color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 14 }}>
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: 6 + (i % 2) * 6,
            borderRadius: 2,
            background: color,
            transformOrigin: 'bottom',
            animation: `k4-pulse ${0.7 + i * 0.15}s ease-in-out ${-i * 0.2}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

export function FairyLights() {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        const y = 40 - t * 16;
        const c = i % 2 ? '#F2679A' : '#E4C08A';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${t * 100}%`,
              top: y + 6,
              width: 10,
              height: 14,
              marginLeft: -5,
              borderRadius: '50% 50% 50% 50%/40% 40% 60% 60%',
              background: c,
              boxShadow: `0 0 14px ${c}`,
              animation: `k4-glow ${1.4 + rnd(i, 6)}s ease-in-out ${-rnd(i, 7) * 2}s infinite`,
            }}
          />
        );
      })}
    </>
  );
}

export function FamilyDots() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === 2 ? 34 : 26,
            height: i === 2 ? 34 : 26,
            borderRadius: '50%',
            background: i === 2 ? '#F2679A' : '#fff',
            border: '2px solid #fff',
            boxShadow: '0 4px 10px rgba(201,167,232,.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#fff',
            alignSelf: 'flex-end',
            animation: `k4-peek ${1.6 + i * 0.15}s ease-in-out ${-i * 0.2}s infinite`,
          }}
        >
          {i === 2 ? '♥' : ''}
        </div>
      ))}
    </div>
  );
}

export function Shine({ width = '30%', opacity = 0.45, duration = 3 }: { width?: string; opacity?: number; duration?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width,
        background: `linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,${opacity}),rgba(255,255,255,0))`,
        animation: `k4-shine ${duration}s ease-in-out infinite`,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ---------- ikoner ---------- */

export const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <path d="M4 11.5l5 5L18 6.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LockIcon = ({ w = 10, h = 12 }: { w?: number; h?: number }) => (
  <svg width={w} height={h} viewBox="0 0 10 12" fill="none">
    <path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="1" y="5" width="8" height="6" rx="1.8" fill="#fff" />
  </svg>
);

export const BigLockIcon = ({ w = 26, h = 30 }: { w?: number; h?: number }) => (
  <svg width={w} height={h} viewBox="0 0 52 60" fill="none">
    <path d="M13 26V18a13 13 0 0 1 26 0v8" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    <rect x="7" y="26" width="38" height="30" rx="9" fill="#fff" />
  </svg>
);

export const ClockIcon = ({ size = 22, color = '#fff', stroke = 2.2 }: { size?: number; color?: string; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const BackIcon = ({ color = '#4A2233' }: { color?: string }) => (
  <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
    <path d="M10 2L2 10l8 8" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CameraIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#B58FDB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="12.5" r="3.2" />
  </svg>
);

export const GalleryIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#B58FDB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10" r="1.5" />
    <path d="M21 15l-5-5-9 9" />
  </svg>
);

/** Det runde, grønne «Forseglet»-stempelet. */
export function Stamp({ size = 120, label = 'Forseglet', style }: { size?: number; label?: string | null; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%,#A3E3CC,#79CFB0 55%,#5FB99A)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        boxShadow: '0 14px 34px rgba(121,207,176,.45),inset 0 3px 8px rgba(255,255,255,.5)',
        animation: 'k4-stamp .7s cubic-bezier(.2,.8,.2,1) .4s both',
        ...style,
      }}
    >
      <CheckIcon size={size * 0.37} />
      {label && (
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>{label}</div>
      )}
    </div>
  );
}
