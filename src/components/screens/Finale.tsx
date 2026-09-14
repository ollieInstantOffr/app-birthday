'use client';

import { useRef, useState } from 'react';
import type { FinaleData } from '../api';
import { Confetti, FairyLights, Orbs, Shine, Stars } from '../decor';
import { Stage } from '../Stage';
import { C, G, hand, padBottom, padTop, sans, serif } from '../tokens';
import { Btn } from '../ui';

/* ---------------------------------------------------- 10 · postkortene */

const PLACEHOLDERS = [
  'repeating-linear-gradient(135deg,#E9D3DC 0 8px,#F3E2E8 8px 16px)',
  'repeating-linear-gradient(135deg,#F1E1BE 0 8px,#F7ECD2 8px 16px)',
  'repeating-linear-gradient(135deg,#F6D2DE 0 8px,#FBE4EB 8px 16px)',
  'repeating-linear-gradient(135deg,#DCCBE9 0 8px,#EADFF5 8px 16px)',
  'repeating-linear-gradient(135deg,#C8D3C0 0 8px,#DDE4D6 8px 16px)',
];
const ROTATE = [-5, 3, -1, 5, -3];
const DROP = [16, 8, 0, 12, 20];
const GAP = 22;

export function Postcards({ data, onDone }: { data: FinaleData; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const touch = useRef<number | null>(null);
  const cards = data.cards;
  const last = index === cards.length - 1;

  const go = (d: number) => setIndex((i) => Math.min(cards.length - 1, Math.max(0, i + d)));

  const widths = cards.map((_, i) => (i === index ? 300 : 200));
  const leftOf = widths.slice(0, index).reduce((sum, w) => sum + w + GAP, 0);
  return (
    <Stage background={G.wine} minHeight={860}>
      {({ w, safeTop }) => {
        const lineTop = Math.max(62, safeTop + 12) + 88;
        const translate = w / 2 - (leftOf + widths[index] / 2);
        return (
      <div
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: sans,
          color: C.blush,
          padding: `${padTop(62)} 24px ${padBottom(48)}`,
          overflow: 'hidden',
        }}
      >
        <Stars dark />
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, position: 'relative' }}>
          <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: C.gold, fontWeight: 700 }}>Dagen din</div>
          <div style={{ fontFamily: serif, fontSize: 17, color: C.gold }}>
            {index + 1} <span style={{ color: 'rgba(255,245,247,.4)' }}>/ {cards.length}</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: -40, right: -40, top: lineTop, height: 2, background: C.gold, transform: 'rotate(-2deg)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: lineTop - 40, height: 120, pointerEvents: 'none' }}>
          <FairyLights />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: lineTop, height: 440, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: GAP,
              transform: `translateX(${translate}px)`,
              transition: 'transform .6s cubic-bezier(.2,.8,.2,1)',
            }}
          >
            {cards.map((card, i) => {
              const current = i === index;
              return (
                <div
                  key={card.taskId}
                  onClick={() => setIndex(i)}
                  style={{
                    position: 'relative',
                    flex: 'none',
                    width: current ? 300 : 200,
                    aspectRatio: '4/5',
                    background: '#FFFDF8',
                    borderRadius: current ? 6 : 5,
                    padding: current ? '14px 14px 62px' : '10px 10px 44px',
                    boxShadow: current ? '0 30px 60px rgba(0,0,0,.55)' : '0 20px 40px rgba(0,0,0,.4)',
                    marginTop: current ? 0 : DROP[i],
                    transform: `rotate(${current ? -1 : ROTATE[i]}deg)`,
                    opacity: current ? 1 : 0.75,
                    transformOrigin: '50% -10px',
                    animation: `k4-sway ${4.6 + i * 0.2}s ease-in-out ${-i * 0.7}s infinite`,
                    transition: 'width .6s cubic-bezier(.2,.8,.2,1), padding .6s, margin .6s, opacity .6s',
                    zIndex: current ? 2 : 1,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: current ? -14 : -10,
                      left: '50%',
                      width: current ? 18 : 14,
                      height: current ? 32 : 26,
                      marginLeft: current ? -9 : -7,
                      background: G.goldTape,
                      borderRadius: 3,
                    }}
                  />
                  <div style={{ width: '100%', height: '100%', background: PLACEHOLDERS[i % PLACEHOLDERS.length], overflow: 'hidden' }}>
                    {card.photoUrl && <img src={card.photoUrl} alt={card.caption} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: current ? 14 : 10,
                      right: current ? 14 : 10,
                      bottom: current ? 14 : 10,
                      fontFamily: hand,
                      fontSize: current ? 26 : 18,
                      lineHeight: current ? '30px' : '22px',
                      color: C.plum,
                      textAlign: 'center',
                    }}
                  >
                    {card.caption}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 70, background: 'linear-gradient(90deg,#3B1B29,rgba(59,27,41,0))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 70, background: 'linear-gradient(270deg,#3B1B29,rgba(59,27,41,0))', pointerEvents: 'none' }} />
        </div>
        {index > 0 && <Arrow side="left" top={lineTop + 230} onClick={() => go(-1)} />}
        {!last && <Arrow side="right" top={lineTop + 230} onClick={() => go(1)} />}

        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div key={index} style={{ fontFamily: hand, fontSize: 28, lineHeight: '34px', textAlign: 'center', maxWidth: 340, textWrap: 'pretty', minHeight: 68, animation: 'k4-fade .6s ease both' }}>
            {cards[index].message}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {cards.map((c, i) => (
              <div key={c.taskId} style={{ width: i === index ? 20 : 6, height: 6, borderRadius: 999, background: i <= index ? C.gold : 'rgba(255,245,247,.3)', transition: 'width .4s' }} />
            ))}
          </div>
          {last ? (
            <Btn variant="gold" shine onClick={onDone} style={{ marginTop: 4, animation: 'k4-rise .5s ease both' }}>
              Og nå — gaven din
            </Btn>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,245,247,.55)', whiteSpace: 'nowrap', height: 62 }}>
              <span>←</span>Sveip for å bla<span>→</span>
            </div>
          )}
        </div>
      </div>
        );
      }}
    </Stage>
  );
}

function Arrow({ side, top, onClick }: { side: 'left' | 'right'; top: number; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={side === 'left' ? 'Forrige' : 'Neste'}
      onClick={onClick}
      className="tap"
      style={{
        position: 'absolute',
        [side]: 12,
        top,
        width: 44,
        height: 44,
        borderRadius: '50%',
        zIndex: 4,
        background: 'rgba(255,255,255,.1)',
        border: '1px solid rgba(255,255,255,.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <svg width="10" height="16" viewBox="0 0 12 20" fill="none">
        <path d={side === 'left' ? 'M10 2L2 10l8 8' : 'M2 2l8 8-8 8'} stroke="#FFF5F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------ 11 · gaven */

export function GiftBox({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    setOpening(true);
    navigator.vibrate?.([40, 60, 120]);
    setTimeout(onOpen, 900);
  };
  return (
    <Stage background={G.blush} onClick={open} style={{ cursor: 'pointer' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: sans,
          color: C.plum,
          textAlign: 'center',
          padding: '0 24px',
          overflow: 'hidden',
        }}
      >
        <Orbs />
        <Stars />
        {opening && <Confetti count={40} seed={7} />}
        <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: C.rose, fontWeight: 700, marginBottom: 36 }}>Ti brev forseglet · husk ordet</div>
        <div style={{ position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(228,192,138,.55),rgba(228,192,138,0) 70%)', animation: 'k4-pulse 2.4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: C.gold, animation: 'k4-halo 3s ease-out infinite' }} />
          <div
            style={{
              width: 210,
              height: 210,
              position: 'relative',
              animation: opening ? 'k4-burst .9s ease-in both' : 'k4-wobble 2.6s ease-in-out infinite',
              transformOrigin: '50% 90%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                bottom: 0,
                height: 126,
                borderRadius: 24,
                background: G.gold,
                boxShadow: '0 24px 48px rgba(200,160,90,.35),inset 0 -8px 16px rgba(160,120,60,.2),inset 0 3px 8px rgba(255,255,255,.6)',
                overflow: 'hidden',
              }}
            >
              <Shine width="40%" opacity={0.5} duration={3.4} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 110, height: 46, borderRadius: 16, background: 'linear-gradient(160deg,#F7E6C0,#E4C08A)', boxShadow: '0 6px 14px rgba(160,120,60,.2)' }} />
            <div style={{ position: 'absolute', left: '50%', bottom: 0, width: 30, height: 156, transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#F98DB4,#F2679A,#F98DB4)' }} />
            <div style={{ position: 'absolute', left: '50%', bottom: 146, transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
              <div style={{ width: 56, height: 44, borderRadius: '28px 28px 28px 6px', background: 'linear-gradient(135deg,#F98DB4,#F2679A)', transform: 'rotate(-14deg)', boxShadow: '0 6px 12px rgba(217,76,130,.25)' }} />
              <div style={{ width: 56, height: 44, borderRadius: '28px 28px 6px 28px', background: 'linear-gradient(225deg,#F98DB4,#F2679A)', transform: 'rotate(14deg)', boxShadow: '0 6px 12px rgba(217,76,130,.25)' }} />
            </div>
          </div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 30, lineHeight: '36px', fontWeight: 500, marginTop: 36, textWrap: 'pretty' }}>Leire. Husk det ordet.</div>
        <div style={{ fontSize: 17, lineHeight: '26px', color: C.mauve, marginTop: 10, animation: 'k4-peek 1.8s ease-in-out infinite' }}>Trykk for å åpne</div>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------ 11b · avsløringen */

export function Reveal({ gift }: { gift: FinaleData['gift'] }) {
  return (
    <Stage background={G.blush} minHeight={820}>
      {({ h }) => (
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
          padding: `${padTop(90, 30)} 24px ${padBottom(48)}`,
          overflow: 'hidden',
        }}
      >
        <Orbs />
        <Confetti count={40} seed={7} />
        <div
          style={{
            width: '100%',
            background: '#fff',
            border: '1px solid rgba(242,103,154,.18)',
            borderRadius: 24,
            boxShadow: '0 20px 50px rgba(217,76,130,.2)',
            padding: '18px 20px 26px',
            position: 'relative',
            animation: 'k4-pop .8s cubic-bezier(.2,.9,.3,1.3) both',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -18,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '7px 18px',
              borderRadius: 999,
              background: G.gold,
              color: '#fff',
              fontSize: 12,
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontWeight: 700,
              boxShadow: '0 6px 16px rgba(200,160,90,.35)',
              whiteSpace: 'nowrap',
            }}
          >
            Gaven din
          </div>
          <div style={{ width: '100%', height: Math.round(Math.max(120, Math.min(190, h - 640))), borderRadius: 18, overflow: 'hidden', position: 'relative', background: 'linear-gradient(160deg,#F7ECD2,#F1E1BE 55%,#E9CFA6)' }}>
            {gift.image ? <img src={gift.image} alt="Keramikk" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <PotteryIllustration />}
            <Shine opacity={0.5} duration={4} />
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 34,
              lineHeight: '40px',
              fontWeight: 500,
              marginTop: 18,
              textWrap: 'pretty',
              background: 'linear-gradient(90deg,#D94C82,#F2679A,#D94C82)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'k4-shimmer 4s linear infinite',
            }}
          >
            {gift.title}
          </div>
          <div style={{ fontFamily: hand, fontSize: 24, lineHeight: '29px', marginTop: 14, textWrap: 'pretty', textAlign: 'left' }}>{gift.message}</div>
          <div style={{ fontFamily: hand, fontSize: 24, color: C.rose, marginTop: 4, textAlign: 'right', fontWeight: 700 }}>— OP ♥</div>
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              borderRadius: 14,
              background: C.blush,
              border: '1px solid rgba(242,103,154,.18)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg,#F98DB4,#F2679A)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flex: 'none',
              }}
            >
              <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700, lineHeight: '10px' }}>{gift.month}</div>
              <div style={{ fontFamily: serif, fontSize: 20, lineHeight: '22px' }}>{gift.day}</div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: '20px' }}>{gift.dateLabel}</div>
              <div style={{ fontSize: 13, lineHeight: '18px', color: C.mauve }}>{[gift.time, gift.place].filter(Boolean).join(' · ')}</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: serif, fontSize: 28, lineHeight: '34px', fontWeight: 500, color: C.rose, textWrap: 'pretty' }}>Gratulerer med dagen, Regine</div>
      </div>
      )}
    </Stage>
  );
}

/** Stemningsbilde: en skål på dreieskiven. Brukes til et ekte bilde er satt i GIFT_IMAGE. */
function PotteryIllustration() {
  return (
    <svg viewBox="0 0 352 190" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="clay" x1="0" x2="1">
          <stop offset="0" stopColor="#C98A63" />
          <stop offset=".5" stopColor="#E0A77F" />
          <stop offset="1" stopColor="#B9774F" />
        </linearGradient>
        <linearGradient id="wheel" x1="0" x2="1">
          <stop offset="0" stopColor="#8A6273" />
          <stop offset=".5" stopColor="#B07D95" />
          <stop offset="1" stopColor="#7A5264" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="40" r="46" fill="#FFD3E1" opacity=".55" />
      <circle cx="300" cy="150" r="60" fill="#E9D8F7" opacity=".6" />
      <ellipse cx="176" cy="160" rx="118" ry="20" fill="url(#wheel)" />
      <ellipse cx="176" cy="154" rx="118" ry="20" fill="#C9A7B8" />
      <ellipse cx="176" cy="154" rx="70" ry="10" fill="#B58FA3" opacity=".6">
        <animate attributeName="rx" values="70;64;70" dur="1.2s" repeatCount="indefinite" />
      </ellipse>
      <path d="M118 78 C120 128 140 150 176 150 C212 150 232 128 234 78 Z" fill="url(#clay)" />
      <ellipse cx="176" cy="78" rx="58" ry="12" fill="#A86846" />
      <ellipse cx="176" cy="78" rx="48" ry="8" fill="#8F5536" />
      <path d="M132 100 C150 106 202 106 220 100" stroke="#F1C9A8" strokeWidth="2" fill="none" opacity=".7" />
      <path d="M138 120 C156 126 196 126 214 120" stroke="#F1C9A8" strokeWidth="2" fill="none" opacity=".5" />
      <path d="M86 96 C100 84 116 86 124 98 L126 132 C112 140 94 136 86 122 Z" fill="#F3C9B1" />
      <path d="M266 96 C252 84 236 86 228 98 L226 132 C240 140 258 136 266 122 Z" fill="#E8B89C" />
      <text x="300" y="46" fontSize="22" fill="#E4C08A" fontFamily="serif">✦</text>
      <text x="36" y="160" fontSize="16" fill="#F2679A" fontFamily="serif">♥</text>
    </svg>
  );
}
