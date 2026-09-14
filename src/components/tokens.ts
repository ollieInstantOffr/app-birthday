import type { CSSProperties } from 'react';

export const serif = "var(--f-serif), Fraunces, Georgia, serif";
export const hand = "var(--f-hand), Caveat, cursive";
export const sans = "var(--f-sans), 'Plus Jakarta Sans', system-ui, sans-serif";

export const C = {
  plum: '#4A2233',
  mauve: '#8A6273',
  muted: '#B07D95',
  rose: '#D94C82',
  pink: '#F2679A',
  gold: '#E4C08A',
  goldText: '#B08A4A',
  lav: '#C9A7E8',
  lavText: '#7B5A9E',
  mint: '#79CFB0',
  night: '#3B1B29',
  blush: '#FFF5F7',
  powder: '#FDE7EE',
  lilac: '#F6E7FA',
};

export const G = {
  blush: 'linear-gradient(180deg,#FFE3EC 0%,#FFF5F7 55%,#F6E7FA 100%)',
  pinkBtn: 'linear-gradient(135deg,#F98DB4,#F2679A 55%,#E2568A)',
  envPink: 'linear-gradient(160deg,#F98DB4,#F2679A 60%,#E2568A)',
  flapPink: 'linear-gradient(180deg,#FFB6CF,#F98DB4)',
  gold: 'linear-gradient(135deg,#F7E6C0,#E4C08A 50%,#CBA36A)',
  goldTape: 'linear-gradient(135deg,#F7E6C0,#E4C08A)',
  lavBtn: 'linear-gradient(135deg,#D7BDF0,#C9A7E8)',
  night: 'radial-gradient(ellipse at 50% 30%,#3D2350 0%,#1E1230 55%,#120A1E 100%)',
  wine: 'radial-gradient(ellipse at 50% 20%,#5A2A40 0%,#3B1B29 60%,#2C1220 100%)',
};

export const eyebrow = (color: string): CSSProperties => ({
  fontSize: 11,
  letterSpacing: 3,
  textTransform: 'uppercase',
  color,
  fontWeight: 700,
});

/**
 * Marger inne i <Stage>: designets verdi, eller safe area + litt luft hvis den er større
 * (notch, Dynamic Island, hjemindikator). Stage setter --safe-top/--safe-bottom i design-enheter.
 */
export const padTop = (min: number, extra = 12) => `max(${min}px, calc(var(--safe-top, 0px) + ${extra}px))`;
export const padBottom = (min: number, extra = 14) => `max(${min}px, calc(var(--safe-bottom, 0px) + ${extra}px))`;
