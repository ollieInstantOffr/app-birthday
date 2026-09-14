'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { taskById } from '@/lib/content/public';
import { api, HttpError, type FinaleData, type GameState } from './api';
import { usePush } from './push';
import Access from './screens/Access';
import Countdown from './screens/Countdown';
import { GiftBox, Postcards, Reveal } from './screens/Finale';
import Letter from './screens/Letter';
import Snoren from './screens/Snoren';
import { CorrectScreen, PhotoSentScreen, StarReveal } from './screens/Solved';
import Welcome from './screens/Welcome';
import { C, G, hand, sans } from './tokens';

type View =
  | { name: 'home' }
  | { name: 'letter'; id: number }
  | { name: 'solved'; id: number }
  | { name: 'postcards' }
  | { name: 'gift' }
  | { name: 'reveal' };

export default function App() {
  const [auth, setAuth] = useState<'unknown' | 'no' | 'yes'>('unknown');
  const [state, setState] = useState<GameState | null>(null);
  const [offset, setOffset] = useState(0);
  const [view, setView] = useState<View>({ name: 'home' });
  const [finale, setFinale] = useState<FinaleData | null>(null);
  const [offline, setOffline] = useState(false);
  const push = usePush(auth === 'yes');
  const pushProp = { visible: push.status === 'default', enable: push.enable };

  const applyState = useCallback((s: GameState) => {
    setState(s);
    setOffset(new Date(s.now).getTime() - Date.now());
  }, []);

  const refresh = useCallback(async () => {
    try {
      applyState(await api<GameState>('/api/state'));
      setAuth('yes');
      setOffline(false);
    } catch (e) {
      if (e instanceof HttpError && e.status === 401) setAuth('no');
      else setOffline(true);
    }
  }, [applyState]);

  useEffect(() => {
    refresh();
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', refresh);
    const poll = setInterval(refresh, 30_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', refresh);
      clearInterval(poll);
    };
  }, [refresh]);

  const openFinale = useCallback(async () => {
    try {
      setFinale(await api<FinaleData>('/api/finale'));
      setView({ name: 'postcards' });
    } catch {
      refresh();
    }
  }, [refresh]);

  const home = useCallback(() => {
    setView({ name: 'home' });
    refresh();
  }, [refresh]);

  const snoren = (s: GameState) => (
    <Snoren
      state={s}
      offset={offset}
      onOpen={(id) => setView({ name: 'letter', id })}
      onGift={openFinale}
      onRefresh={refresh}
      push={pushProp}
    />
  );

  const screen = (): ReactNode => {
    if (auth === 'no') return <Access onSuccess={refresh} />;
    if (!state) return <Splash offline={offline} />;

    const first = state.tasks[0];
    if (first.status === 'timelocked' && first.unlocksAt) {
      return <Countdown target={first.unlocksAt} offset={offset} onDone={refresh} push={pushProp} />;
    }
    if (!state.welcomed) {
      return (
        <Welcome
          eventDate={state.eventDate}
          onContinue={async () => {
            await api('/api/welcome', {});
            await refresh();
          }}
        />
      );
    }

    if (view.name === 'letter' || view.name === 'solved') {
      const task = taskById(view.id)!;
      const tv = state.tasks.find((t) => t.id === view.id)!;
      if (tv.status === 'solved') {
        if (task.id === 5) return <StarReveal view={tv} onDone={home} />;
        if (task.kind === 'photo') return <PhotoSentScreen task={task} view={tv} onBack={home} />;
        return <CorrectScreen task={task} view={tv} next={state.tasks.find((t) => t.id === task.id + 1)} onBack={home} onGift={openFinale} />;
      }
      if (tv.status === 'available') {
        return (
          <Letter
            key={task.id}
            task={task}
            view={tv}
            offset={offset}
            onBack={home}
            onState={applyState}
            onSolved={() => setView({ name: 'solved', id: task.id })}
          />
        );
      }
      // Brevet ble låst igjen (f.eks. nullstilt fra admin) — tilbake til snoren.
      return snoren(state);
    }

    if (view.name === 'postcards' && finale) return <Postcards data={finale} onDone={() => setView({ name: 'gift' })} />;
    if (view.name === 'gift' && finale) {
      return (
        <GiftBox
          onOpen={() => {
            api('/api/finale', {}).catch(() => {});
            setView({ name: 'reveal' });
          }}
        />
      );
    }
    if (view.name === 'reveal' && finale) return <Reveal gift={finale.gift} />;

    return snoren(state);
  };

  return (
    <>
      {screen()}
      {auth === 'yes' && state?.testMode && <TestBadge onFinale={openFinale} onHome={home} />}
    </>
  );
}

/** Vises bare i testmodus, så det ikke glemmes på. */
function TestBadge({ onFinale, onHome }: { onFinale: () => void; onHome: () => void }) {
  const chip = {
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  };
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: 'calc(env(safe-area-inset-top, 0px) + 4px)',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 5px 4px 12px',
        borderRadius: 999,
        background: 'rgba(59,27,41,.88)',
        color: '#FFF5F7',
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        boxShadow: '0 6px 16px rgba(0,0,0,.2)',
        whiteSpace: 'nowrap',
      }}
    >
      Testmodus
      <button type="button" onClick={onHome} style={{ ...chip, background: 'rgba(255,255,255,.14)', color: '#FFF5F7' }}>
        Snoren
      </button>
      <button type="button" onClick={onFinale} style={{ ...chip, background: C.gold, color: C.night }}>
        Finalen ›
      </button>
    </div>
  );
}

function Splash({ offline }: { offline: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: G.blush, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ color: C.pink, fontSize: 28, animation: 'k4-beat 1.4s ease-in-out infinite' }}>♥</div>
      {offline && <div style={{ fontFamily: hand, fontSize: 22, color: C.mauve }}>ingen nett akkurat nå — prøver igjen…</div>}
    </div>
  );
}
