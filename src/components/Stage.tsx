'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/** Designet er tegnet for 440 pt bredde (iPhone 17 Pro Max). */
export const DESIGN_W = 440;
/** Bredere enn dette (nettbrett, liggende) holdes innholdet i en sentrert kolonne. */
const MAX_W = 520;
const MAX_SCALE = 1.15;

export interface StageInfo {
  /** Lerretets bredde og høyde i design-enheter — fyller alltid hele skjermen. */
  w: number;
  h: number;
  s: number;
  /** Safe area (notch, Dynamic Island, hjemindikator) i design-enheter. */
  safeTop: number;
  safeBottom: number;
}

/** Layout-viewport (endres ikke når tastaturet åpnes). */
function useWindowSize() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return size;
}

/** Synlig høyde — krymper når tastaturet er oppe. */
export function useVisualViewport() {
  const [vp, setVp] = useState<{ h: number; top: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    const update = () => setVp({ h: vv ? vv.height : window.innerHeight, top: vv ? vv.offsetTop : 0 });
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return vp;
}

function useSafeArea() {
  const [safe, setSafe] = useState({ top: 0, bottom: 0 });
  useEffect(() => {
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)';
    document.body.appendChild(probe);
    const read = () => {
      const cs = getComputedStyle(probe);
      setSafe({ top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 });
    };
    read();
    window.addEventListener('resize', read);
    return () => {
      window.removeEventListener('resize', read);
      probe.remove();
    };
  }, []);
  return safe;
}

/**
 * Lerret som fyller hele skjermen på alle telefoner. Innholdet skaleres ut fra bredden
 * (440 i designet), men aldri så stort at det ikke får plass i høyden (`minHeight`).
 * Bredden og høyden i design-enheter varierer derfor med skjermformatet — skjermene
 * bruker flex eller `StageInfo` for å fordele seg, i stedet for faste koordinater.
 *
 * `visual` følger den synlige høyden, så tastaturet ikke dekker svarfeltet.
 */
export function Stage({
  background,
  backdrop,
  children,
  onClick,
  style,
  minHeight = 800,
  visual = false,
}: {
  background: string;
  backdrop?: ReactNode;
  children: ReactNode | ((stage: StageInfo) => ReactNode);
  onClick?: () => void;
  style?: CSSProperties;
  minHeight?: number;
  visual?: boolean;
}) {
  const size = useWindowSize();
  const vv = useVisualViewport();
  const safe = useSafeArea();

  if (!size) return <div style={{ position: 'fixed', inset: 0, background }} />;

  const s = Math.min(size.w / DESIGN_W, size.h / minHeight, MAX_SCALE);
  const viewH = visual && vv ? vv.h : size.h;
  const viewTop = visual && vv ? vv.top : 0;
  const w = Math.min(size.w / s, MAX_W);
  const h = viewH / s;
  const info: StageInfo = { w, h, s, safeTop: safe.top / s, safeBottom: safe.bottom / s };

  const canvas = {
    position: 'absolute',
    left: (size.w - w * s) / 2,
    top: 0,
    width: w,
    height: h,
    transform: `scale(${s})`,
    transformOrigin: '0 0',
    '--safe-top': `${info.safeTop}px`,
    '--safe-bottom': `${info.safeBottom}px`,
  } as CSSProperties;

  return (
    <div
      onClick={onClick}
      style={{ position: 'fixed', left: 0, right: 0, top: viewTop, height: viewH, background, overflow: 'hidden', animation: 'k4-fade .35s ease both', ...style }}
    >
      {backdrop}
      <div style={canvas}>{typeof children === 'function' ? children(info) : children}</div>
    </div>
  );
}
