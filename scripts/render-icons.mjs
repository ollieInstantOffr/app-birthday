// Tegner PWA-ikonene fra designet (Rad 3 i Claude Design-prosjektet) til PNG med headless Chrome.
// Kjør: npm run icons
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.resolve('public/pwa');
mkdirSync(OUT, { recursive: true });
const tmp = mkdtempSync(path.join(tmpdir(), 'icons-'));

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&display=block" rel="stylesheet">`;
const page = (size, inner) => `<!doctype html><html><head><meta charset="utf-8">${FONTS}
<style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}</style></head>
<body>${inner}</body></html>`;

// App-ikonet: designet er 512 px, full-bleed (iOS/Android legger på avrunding selv).
const master = (scale) => `<div style="width:512px;height:512px;transform:scale(${scale});transform-origin:0 0;background:linear-gradient(160deg,#FFE3EC 0%,#FFF5F7 48%,#F6E7FA 100%);position:relative;overflow:hidden">
  <div style="position:absolute;left:-80px;top:-60px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,#FFD3E1,rgba(255,255,255,0) 70%)"></div>
  <div style="position:absolute;right:-90px;bottom:-70px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,#E9D8F7,rgba(255,255,255,0) 70%)"></div>
  <div style="position:absolute;left:78px;top:92px;color:#E4C08A;font-size:34px;font-family:Fraunces,serif;line-height:1">✦</div>
  <div style="position:absolute;right:92px;top:118px;color:#C9A7E8;font-size:24px;font-family:Fraunces,serif;line-height:1">✦</div>
  <div style="position:absolute;left:110px;bottom:100px;color:#F2679A;font-size:22px;font-family:Fraunces,serif;line-height:1">♥</div>
  <div style="position:absolute;right:76px;bottom:128px;color:#E4C08A;font-size:20px;font-family:Fraunces,serif;line-height:1">✦</div>
  <div style="position:absolute;left:50%;top:50%;width:330px;height:230px;transform:translate(-50%,-46%) rotate(-4deg)">
    <div style="position:absolute;inset:0;background:linear-gradient(160deg,#F98DB4,#F2679A 60%,#E2568A);border-radius:34px;box-shadow:0 26px 50px rgba(217,76,130,.35)"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#FFB6CF,#F98DB4);clip-path:polygon(0 0,50% 62%,100% 0);border-radius:34px 34px 0 0"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(200deg,rgba(255,255,255,.28),rgba(255,255,255,0) 45%);border-radius:34px"></div>
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-38%);width:118px;height:118px;border-radius:50%;background:linear-gradient(135deg,#F7E6C0,#E4C08A 50%,#CBA36A);display:flex;align-items:center;justify-content:center;box-shadow:0 12px 28px rgba(0,0,0,.2),inset 0 4px 8px rgba(255,255,255,.65),inset 0 -6px 10px rgba(160,120,60,.25)"><div style="color:#fff;font-size:62px;line-height:1;font-family:Fraunces,serif;margin-top:-4px">♥</div></div>
  </div>
</div>`;

// Maskable: konvolutten innenfor 80 % safe zone. Designet er 128 px.
const maskable = (scale) => `<div style="width:128px;height:128px;transform:scale(${scale});transform-origin:0 0;background:linear-gradient(160deg,#FFE3EC 0%,#FFF5F7 48%,#F6E7FA 100%);position:relative;overflow:hidden">
  <div style="position:absolute;left:50%;top:50%;width:66px;height:46px;transform:translate(-50%,-46%) rotate(-4deg)">
    <div style="position:absolute;inset:0;background:linear-gradient(160deg,#F98DB4,#F2679A 60%,#E2568A);border-radius:7px"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#FFB6CF,#F98DB4);clip-path:polygon(0 0,50% 62%,100% 0);border-radius:7px 7px 0 0"></div>
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-38%);width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#F7E6C0,#E4C08A 50%,#CBA36A);display:flex;align-items:center;justify-content:center"><div style="color:#fff;font-size:13px;line-height:1">♥</div></div>
  </div>
</div>`;

const fav64 = `<div style="width:64px;height:64px;border-radius:14px;background:linear-gradient(160deg,#F98DB4,#F2679A 60%,#E2568A);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden"><div style="position:absolute;inset:0;background:linear-gradient(180deg,#FFB6CF,#F98DB4);clip-path:polygon(0 0,50% 58%,100% 0)"></div><div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#F7E6C0,#E4C08A 50%,#CBA36A);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 2px 6px rgba(0,0,0,.2)"><div style="color:#fff;font-size:20px;line-height:1;font-family:Fraunces,serif;margin-top:-1px">♥</div></div></div>`;
const fav32 = `<div style="width:32px;height:32px;border-radius:7px;background:linear-gradient(160deg,#F98DB4,#F2679A 60%,#E2568A);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden"><div style="position:absolute;inset:0;background:linear-gradient(180deg,#FFB6CF,#F98DB4);clip-path:polygon(0 0,50% 58%,100% 0)"></div><div style="width:17px;height:17px;border-radius:50%;background:#E4C08A;display:flex;align-items:center;justify-content:center;position:relative"><div style="color:#fff;font-size:10px;line-height:1">♥</div></div></div>`;
const fav16 = `<div style="width:16px;height:16px;border-radius:4px;background:#F2679A;display:flex;align-items:center;justify-content:center"><div style="width:9px;height:9px;border-radius:50%;background:#E4C08A"></div></div>`;

const jobs = [
  ['icon-1024.png', 1024, master(2)],
  ['icon-512.png', 512, master(1)],
  ['icon-192.png', 192, master(192 / 512)],
  ['apple-touch-icon-180.png', 180, master(180 / 512)],
  ['icon-maskable-512.png', 512, maskable(4)],
  ['favicon-64.png', 64, fav64],
  ['favicon-32.png', 32, fav32],
  ['favicon-16.png', 16, fav16],
];

for (const [name, size, inner] of jobs) {
  const html = path.join(tmp, name.replace('.png', '.html'));
  writeFileSync(html, page(size, inner));
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    '--virtual-time-budget=4000',
    `--window-size=${size},${size}`,
    `--screenshot=${path.join(OUT, name)}`,
    `file://${html}`,
  ], { stdio: 'ignore' });
  console.log('✓', name);
}
