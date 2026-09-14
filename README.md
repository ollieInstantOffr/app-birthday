# Bursdagsjakten

Ti brev til Regine, én dag. Next.js 16 (App Router) · PostgreSQL + Prisma · S3 eller lokal lagring · Docker Compose.
Design: Claude Design-prosjektet «Bursdagsjakten v5 Konvoluttsnoren». Innhold og regler: `02-funksjon-og-oppgaver.md`.

## Kjøre lokalt

```bash
cp .env.example .env        # fyll inn verdier
npm install
npm run db:up               # Postgres i Docker
npx prisma migrate deploy
npm run dev
```

- Spillet: http://localhost:7661 — koden er fødselsdatoen (`ACCESS_CODE`, DDMMÅÅ).
- Admin: http://localhost:7661/admin — passord i `ADMIN_PASSWORD`.

## Admin (`/admin`)

- **Testmodus** — fjerner tidslåsene, gir hint med en gang, og en «Finalen»-knapp øverst i appen. Brevene må fortsatt løses i rekkefølge. Et merke «Testmodus» vises i appen så lenge den er på.
- **Fremdrift** — status per brev, når det ble åpnet og løst, alle svarforsøk og hint, pluss en aktivitetslogg for hele dagen. Oppdateres hvert 15. sekund.
- **Bilder** — alle opplastede bilder i et galleri, med stor visning og lenke til originalen.
- **Redningsplanker** — «Åpne før kl. …» (hopper over tidslåsen), «Marker som løst» og «Nullstill brev» per brev. Rekkefølgen kan ikke hoppes over: et brev åpner bare når alle før er forseglet.
- **Nullstill appen** — sletter all fremdrift, med valg om å slette bildene og å logge ut alle Regines innloggede enheter (full nullstilling).

- **Varsler til Regine** — status for enhetene hennes, et felt for å sende egne varsler (med hurtigvalg), og logg over alt som er sendt.

Alternativ til testmodus: sett `EVENT_DATE` til dagens dato for å øve med ekte tidslåser.

## Push-varsler

- Regine slår på varsler med 🔔-knappen i appen (på nedtellingen og snoren). **På iPhone må appen være åpnet fra hjemskjermen** (iOS 16.4+), og hun må trykke «Tillat».
- Automatiske varsler kl. **07:00, 13:15 og 18:15** når et tidslåst brev kommer. Sendes ikke i testmodus. Slår hun på varsler kvelden før, får hun «God morgen, Regine 💌» kl. 07:00.
- Egne varsler sendes fra `/admin`.
- Krever `VAPID_PUBLIC_KEY` og `VAPID_PRIVATE_KEY` i `.env` (lag dem én gang med `npx web-push generate-vapid-keys`). Bruk **samme nøkler** på serveren — nye nøkler betyr at hun må slå på varsler på nytt.

## Hvor ting ligger

| Hva | Fil |
|---|---|
| Brevtekstene (vises i appen) | `src/lib/content/public.ts` |
| Fasit, hint, meldinger, stjernen, gaven | `src/lib/content/secret.ts` (sendes aldri til klienten før brevet er løst) |
| Tidslås, hint-regler, status | `src/lib/progress.ts` |
| Skjermene | `src/components/screens/` |
| PWA-ikoner | `public/pwa/` (tegnes på nytt fra designet med `npm run icons`) |

Svarene normaliseres (store/små bokstaver, mellomrom, tegnsetting, æøå). Brev 1 og 7 godtar svar som *inneholder* fasiten.

## Bilder

- Er `S3_BUCKET` satt, laster telefonen opp direkte til S3 med en presignert URL. Bøtta bør ha **CORS** som tillater `PUT` fra appens domene med header `Content-Type`. Feiler direkte opplasting (f.eks. manglende CORS), sender appen bildet via serveren til bøtta i stedet — så det virker uansett.
- Uten S3 lagres bildene i `UPLOAD_DIR` (i Docker: volumet `uploads`).
- Bildene komprimeres til maks 1600 px bredde på telefonen før opplasting.

## Deploy

```bash
docker compose up -d --build
```

Kjør bak reverse proxy med **HTTPS** (kreves for kamera på iPhone). Migreringer kjøres automatisk ved start.

Appen lytter på port **7661** (både på hosten og i containeren). Endre med `APP_PORT=` i `.env`. Bruk alltid `--build` etter kodeendringer — ellers kjører Docker det gamle imaget.
Valgfritt i `.env`: `COURSE_PLACE` (sted for keramikkurset) og `GIFT_IMAGE` (URL til et ekte bilde i avsløringen).

## Før bursdagen

1. Test hele løpet på hennes iPhone, lagt til på hjemskjermen.
2. Slå av testmodus, nullstill i admin (gjerne med «slett bildene»), og sjekk at `EVENT_DATE=2026-09-18`.
3. Gi moren kortet «Ting jeg er glad i».
4. Ha `/admin` åpen gjennom dagen — «Lås opp manuelt» og «Marker som løst» er redningsplankene.
