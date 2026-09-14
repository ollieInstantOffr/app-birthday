# Bursdagsjakten — Funksjonsbeskrivelse og oppgaveforslag

> **Stack:** Next.js (App Router) · PostgreSQL + Prisma · S3 for bildeopplasting · Docker Compose
> **Brukere:** 1 spiller (bursdagsbarnet) + 1 admin (Ollie)
> **Levetid:** Én dag. Dette er en engangsgave, ikke et produkt som skal skaleres.

---

## 1. Konseptet

Hun får en lenke om morgenen på bursdagen. Appen åpner klokken 07:00. Ti oppgaver, én om gangen, låst i rekkefølge. Riktig svar låser opp neste. Det finnes tre typer oppgaver: **spørsmål** hun må svare på, **bildeutfordringer** der hun laster opp et bilde, og **sangoppgaver** der hun lytter til en sang og finner et ord eller en setning.

Når oppgave 10 er løst, spiller appen av en filmrull av alle bildene hun har lastet opp gjennom dagen — og avslører til slutt hva bursdagsgaven er.

---

## 2. Brukerreisen

| Steg | Hva skjer |
|---|---|
| 1 | Hun åpner lenken. Appen ber om en kode (4 siffer, f.eks. datoen dere ble sammen). |
| 2 | Er klokken før 07:00: nedtelling. Etter 07:00: velkomsthilsen. |
| 3 | Stien vises med 10 perler — 1 aktiv, 9 låst. |
| 4 | Hun åpner oppgave 1, løser den, får konfetti + en personlig melding. |
| 5 | Oppgave 2 låses opp. Gjentas til 10. |
| 6 | Tre oppgaver er **tidslåst**: oppgave 1 (07:00), 5 (13:15) og 10 (18:15). Resten åpner så snart forrige er løst. |
| 7 | Etter oppgave 10: gaveesken tennes på stien. |
| 8 | Finale: filmrull av bildene → gaveavsløring. |

---

## 3. Funksjonelle krav

### 3.1 Innlogging
- Ingen brukerkontoer. Én delt hemmelig kode satt i `.env` (`ACCESS_CODE`).
- Ved riktig kode settes en signert `httpOnly`-cookie som varer i 48 timer.
- Admin-siden (`/admin`) bruker en egen kode (`ADMIN_CODE`).

### 3.2 Oppgavetyper
Tre typer. Alle deler samme kortmal. Typen styrer hva som vises og hvordan svaret valideres.

| Type | Hva hun gjør | Input | Validering |
|---|---|---|---|
| `QUESTION` | Svarer på et spørsmål | Tekstfelt — eller 2–4 store knapper hvis `choices` er satt | Normalisert sammenligning mot `acceptedAnswers` |
| `PHOTO` | Bildeutfordring | Kamera **eller** kamerarull (`<input type="file" accept="image/*">` — iPhone lar henne velge) | Ingen validering — opplasting = løst |
| `SONG` | Lytter til en sang og finner ordet / setningen | Tekstfelt, med valgfri lydavspiller (uten lyd må hun selv finne sangen) | Som `QUESTION`, men se `matchMode` under |

**Normalisering:** lowercase, trim, fjern tegnsetting, slå sammen mellomrom, godta `æ/ae`, `ø/o/oe`, `å/a/aa`.

**`matchMode`** — viktig for sangoppgaver der svaret er en hel setning:
- `EXACT` — normalisert svar må være lik et av `acceptedAnswers`. Bruk for enkeltord og korte svar.
- `KEYWORDS` — godkjent hvis svaret inneholder alle ordene i `acceptedAnswers[0]`. Bruk for setninger, så hun ikke feiler på et «og» eller en apostrof.

**Lydkilde for `SONG`:** to alternativer per oppgave.
- `audioUrl` — et kort klipp (15–30 sek) lagt i `/public/audio/`, som starter rett før ordet. Anbefalt: presist, spiller inne i appen, ingen app-hopp.
- `spotifyUrl` + `spotifyTimestamp` — åpner Spotify og ber henne hoppe til tidspunktet. Mer stemning, men mer som kan gå galt.

### 3.3 Svarhåndtering
- Svar sendes til `POST /api/tasks/[id]/answer`. **All validering skjer på serveren** — fasiten skal aldri ligge i klienten.
- Feil svar øker `attemptCount` og lagres i `AttemptLog`.
- Hint blir tilgjengelig etter 2 feil forsøk ELLER 5 minutter på oppgaven.
- Det finnes ingen «gi opp»-knapp. Etter 5 feil forsøk vises hint 2, som i praksis er svaret.

### 3.4 Bildeopplasting
- Klienten sender bildet til serveren: `POST /api/tasks/[id]/photo` med JPEG i body. Serveren lagrer det i S3 (eller lokalt).
- Klienten laster opp direkte til S3. Bildet passerer aldri serveren.
- Nøkkel: `birthday/2026/task-{n}/{uuid}.jpg`.
- Serveren lagrer `key` i `Submission`, og genererer presignerte GET-URL-er (1 times levetid) ved visning.
- Klientside-komprimering til maks 1600px bredde før opplasting — iPhone-bilder er store.

### 3.5 Tidslåsing
- Hver oppgave kan ha `unlocksAt` (tidspunkt på dagen). Er den satt og ikke passert, viser kortet en nedtelling i stedet for oppgaven.
- **Kun tre oppgaver har `unlocksAt`:** oppgave 1 kl. 07:00, oppgave 5 kl. 13:15 (lunsj med mamma ca. 13:30–14:00) og oppgave 10 kl. 18:15 (på restauranten, bord kl. 18).
- Alle andre har `unlocksAt = null` og åpner så snart forrige oppgave er løst.
- **Rekkefølgen gjelder alltid** — en tidslåst oppgave åpner først når både klokka er passert *og* forrige oppgave er løst.

### 3.6 Finalen
- Låses opp når alle 10 har `status = SOLVED`.
- Henter alle innsendte bilder i rekkefølge, viser dem som en automatisk avspilt sekvens med bildetekster fra `Task.finaleCaption`.
- Deretter gaveavsløringen: bilde + navn + avsluttende melding, alt fra en `Gift`-rad (eller bare hardkodet — det er én gave).
- **Gaven i appen:** et keramikkurs for Ollie og Regine sammen. Vis et stemningsbilde (hender i leire / dreieskive) og en kort, varm tekst — ingen fysisk pakke, så avsløringen fungerer fint mens dere sitter på restauranten.

### 3.7 Admin
- `/admin` viser: hvilken oppgave hun er på nå, tidspunkt for hver løsning, antall forsøk per oppgave, og thumbnails av alle innsendte bilder.
- En knapp per oppgave: «Lås opp manuelt» — redningsplanken hvis noe står fast.
- Oppdaterer seg selv hvert 15. sekund. Ollie kommer til å ha denne åpen hele dagen.

---

## 4. Datamodell (Prisma)

```prisma
model Task {
  id            Int       @id @default(autoincrement())
  order         Int       @unique
  type          TaskType
  title         String
  prompt        String
  acceptedAnswers String[]          // tom for PHOTO
  matchMode     MatchMode @default(EXACT)
  choices       String[]             // QUESTION: gir knapper i stedet for tekstfelt
  hint1         String?
  hint2         String?
  successMessage String                // vises etter riktig svar
  successImageUrl String?              // f.eks. stjernesertifikatet i oppgave 5
  audioUrl      String?              // SONG: "/audio/oppgave-3.mp3"
  spotifyUrl    String?
  spotifyTimestamp String?             // "1:24"
  finaleCaption String?                // bildetekst i filmrullen
  unlocksAt     DateTime?
  status        TaskStatus @default(LOCKED)
  attemptCount  Int       @default(0)
  solvedAt      DateTime?
  submissions   Submission[]
  attempts      AttemptLog[]
}

model Submission {
  id        Int      @id @default(autoincrement())
  taskId    Int
  task      Task     @relation(fields: [taskId], references: [id])
  s3Key     String?
  textValue String?
  createdAt DateTime @default(now())
}

model AttemptLog {
  id        Int      @id @default(autoincrement())
  taskId    Int
  task      Task     @relation(fields: [taskId], references: [id])
  value     String
  correct   Boolean
  createdAt DateTime @default(now())
}

enum TaskType   { QUESTION PHOTO SONG }
enum MatchMode  { EXACT KEYWORDS }
enum TaskStatus { LOCKED ACTIVE SOLVED }
```

Alle 10 oppgavene legges inn via `prisma/seed.ts`. Det gjør det trivielt å justere tekst og fasit fram til bursdagsmorgenen.

---

## 5. API-ruter

| Rute | Metode | Beskrivelse |
|---|---|---|
| `/api/auth` | POST | Bytter kode mot cookie |
| `/api/tasks` | GET | Alle oppgaver, men **uten** `acceptedAnswers` og `hint2` for låste |
| `/api/tasks/[id]/answer` | POST | Validerer svar, oppdaterer status, låser opp neste |
| `/api/tasks/[id]/hint` | GET | Returnerer hint hvis vilkårene er oppfylt |
| `/api/tasks/[id]/photo` | POST | Tar imot bildet og lagrer det i S3 eller lokalt |
| `/api/finale` | GET | 403 hvis ikke alle løst; ellers bilder + gavedata |
| `/api/admin/state` | GET | Full status til admin |
| `/api/admin/unlock/[id]` | POST | Manuell opplåsing |

---

## 6. Docker og miljø

`docker-compose.yml` med to tjenester:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: birthday
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: birthday
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U birthday"]
      interval: 5s
  app:
    build: .
    ports: ["7661:7661"]
    env_file: .env
    depends_on:
      db: { condition: service_healthy }
    command: sh -c "npx prisma migrate deploy && npx prisma db seed && node server.js"
volumes: { pgdata: }
```

`Dockerfile`: Next.js standalone-output, multi-stage (deps → build → runner på `node:22-alpine`).

**Miljøvariabler:**
```
DATABASE_URL=postgresql://birthday:...@db:5432/birthday
ACCESS_CODE=####
ADMIN_CODE=####
SESSION_SECRET=...
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=            # valgfri, for S3-kompatible tjenester
APP_START_TIME=2026-09-18T07:00:00+02:00
TZ=Europe/Oslo
```

Kjøres bak reverse proxy på ditt eget oppsett, med HTTPS og et eget subdomene. **HTTPS er påkrevd** — iPhone gir ikke kameratilgang over vanlig HTTP.

---

## 7. De 10 oppgavene

Fasit og hint er forslag — bytt ut med det som faktisk stemmer for dere to.

**Fordeling:** 4 spørsmål · 5 bildeutfordringer · 1 sangoppgave.

Alt i `[klammer]` må fylles inn med noe som faktisk stemmer for dere.

| # | Tittel | Type | Åpner |
|---|---|---|---|
| 1 | Der det begynte | Spørsmål | 07:00 🔒 |
| 2 | Du og lillegutt | Bilde | Etter 1 |
| 3 | Sangen vår | Sang — ord | Etter 2 |
| 4 | Sommeren din | Bilde | Etter 3 |
| 5 | Mammas gåte | Spørsmål | 13:15 🔒 |
| 6 | Lunsj med mamma | Bilde | Etter 5 |
| 7 | Emoji-minnet | Spørsmål (knapper) | Etter 6 |
| 8 | Lillegutts bilde | Bilde | Etter 7 |
| 9 | Hele gjengen | Bilde | Etter 8 |
| 10 | Den siste låsen | Spørsmål | 18:15 🔒 |

### Oppgave 1 — «Der det begynte» · `QUESTION` · 🔒 07:00
**Spørsmål:** «Alt starter et sted. Skriv navnet på stedet der vi møttes for aller første gang.»
**Fasit:** `miso` · `KEYWORDS` — godtar «Miso Ramen», «misoramen», «Miso Ramen på Vika» osv.
**Hint 1:** «Vi spiste noe varmt i en bolle.»
**Hint 2:** «På Vika. M _ _ _  R _ _ _ _»
**Suksessmelding:** «Miso Ramen på Vika. Der begynte alt — og jeg har vært sulten på mer av deg siden.»

### Oppgave 2 — «Du og lillegutt» · `PHOTO` · etter oppgave 1
**Utfordring:** «Finn lillegutt. Ta et bilde av dere to — før dagen har rukket å starte.»
Morgenbilde, gjerne i senga eller ved frokostbordet. Sørg for at lillegutt er i nærheten når hun åpner appen.
**Suksessmelding:** «Det bildet skal vi ha på veggen.»
**Filmrull-tekst:** «Bursdagsmorgen med lillegutt.»

### Oppgave 3 — «Sangen vår» · `SONG` · `EXACT` · etter oppgave 2
**Oppgave:** «Det finnes én sang som gjør at jeg tenker på deg hver gang. Jeg ser den som vår sang. Sett den på, hopp til 1:25 og hør etter ordet.»
**Ingen lyd eller sangnavn i appen** — hun må selv vite hvilken sang det er.
**Sang (bare for Ollie):** *Daisies* — Justin Bieber. Ordet kommer på **1:25–1:27**.
**Fasit:** `closer` · `EXACT` — kun ordet, ikke hele linja
**Hint 1:** «Justin Bieber.»
**Hint 2:** «Daisies. Han sier ordet tre ganger på rad: C _ _ _ _ _.»
**Suksessmelding:** «Closer. Det er alt jeg vil — nærmere deg, hver eneste dag.»

### Oppgave 4 — «Sommeren din» · `PHOTO` · etter oppgave 3
**Utfordring:** «Last opp favorittbildet ditt fra i sommer. Bare ett. Velg godt.»
Her er kamerarullen poenget — ikke kameraet. Enkel oppgave hun kan ta når som helst før lunsj.
**Suksessmelding:** «Jeg visste du ville velge det.» *(eller noe mer ærlig hvis du ikke vet)*
**Filmrull-tekst:** «Sommeren 2026.»

### Oppgave 5 — «Mammas gåte» · `QUESTION` · 🔒 13:15
**Oppgave i appen:** «Denne gåten har ikke jeg. Mamma har den. Spør henne pent — og skriv svaret her.»
Gåten står **ikke** i appen. Moren har et kort fra Ollie som hun gir Regine under lunsjen, ca. 13:30–14:00: «Ollie ba meg gi deg denne.»

**Kortet (fra Ollie):**
> **Ting jeg er glad i**
>
> Jeg er glad i sene sommerkvelder der vi blir sittende ute til himmelen blir mørk, fordi ingen av oss vil at dagen skal være over.
> Jeg er glad i at noen husker de små tingene, og alltid vet hva som skal til for å få meg til å smile.
> Jeg er glad i å se en liten gutt sovne trygt inntil mammaen sin, og få være en del av det hver eneste dag.
> Jeg er glad i et menneske som gir og gir, og likevel alltid har mer omsorg, mer latter og mer energi.
> Jeg er glad i at det finnes én person som gjør at alt kjennes som å komme hjem igjen.
> Og jeg er glad i å vite at det fineste jeg har, lyser like sterkt enten jeg er nær eller langt borte.
>
> Det er gjemt et ord i denne lista. Det står også skrevet et helt annet sted.
> Finn det, og skriv det i appen.
>
> — Ollie

Teksten nevner aldri henne, og oppgaven sier ikke at svaret er et navn. Hun leter etter «et ord» — og oppdager først på slutten at alt Ollie er glad i, staver navnet hennes.

**Løsning:** siste bokstav i hver setning: ove**r** · smil**e** · da**g** · energ**i** · igje**n** · bort**e** → **REGINE**
(Bonus: «energi» har de samme bokstavene som «Regine».)
**Fasit:** `regine`
**Hint 1:** «Ordet står ikke i teksten. Det er bygget av bokstaver.»
**Hint 2:** «Se på siste bokstav i hver setning.»
**Suksessmelding — stjerneavsløringen:**
> Regine.
> Alt jeg er glad i, staver navnet ditt.
>
> Og det står skrevet et sted til: på himmelen.
> Fra i dag finnes det en stjerne som heter Regine. Den lyser hver eneste natt, enten du ser den eller ikke, og den kommer til å lyse lenge etter at vi har sluttet å telle bursdager.
>
> Den er for svak til å se med bare øynene. Men den er der, i Jomfruen — og jeg skal vise deg hvor.
>
> Gratulerer med dagen. ✨

**I appen:** vis stjernesertifikatet (`/public/star/sertifikat.jpg`, original PDF i `/public/star/sertifikat.pdf`) og stjernedataene under meldingen:
- **Navn:** Regine
- **Stjernebilde:** Jomfruen (Virgo)
- **Rektascensjon (RA):** 14h 18m 41,2s
- **Deklinasjon (Dec):** −7° 0′ 49,3″
- **Lysstyrke:** magnitude 7,44
- **Katalognummer:** HIP 69933 (søk på dette i Stellarium / SkySafari for å finne den)
- **Registrert:** 18. september 2026 · star-register.eu · nr. 06BE349F6

**Synlighet — viktig for teksten:** magnitude 7,44 er for svakt til å se med bare øynene (grensen er ca. 6), så hun trenger kikkert eller en stjerneapp. I september står Jomfruen lavt i vest og går ned rett etter at det blir mørkt i Oslo. Best synlig på vårkvelder (april–mai). Stjerneapper som Stellarium eller SkySafari viser den uansett — også under horisonten — når man peker telefonen i riktig retning. Krever et felt for bilde i suksessmeldingen, f.eks. `successImageUrl String?` på `Task`.

**Avtal med moren på forhånd:**
- Gi henne kortet ferdig skrevet (gjerne i en liten konvolutt), så hun bare trenger å gi det videre.
- Si at hun ikke skal gi kortet før Regine sier at appen ber om det.
- Kortet må leses på papir — løsningen ligger i bokstavene, ikke i det man hører.
- `unlocksAt` er 13:15 — et kvarter før lunsjen, så oppgaven garantert er åpen når de setter seg. Flytter lunsjen seg, bruk «Lås opp manuelt» i admin.
- Oppgavene er låst i rekkefølge: har hun ikke løst 1–4 før lunsj, er gåten fortsatt låst. Følg med i admin rundt 13:00 og lås opp manuelt om nødvendig.

### Oppgave 6 — «Lunsj med mamma» · `PHOTO` · etter oppgave 5
**Utfordring:** «Ta et bilde av deg og mamma — begge må smile.»
Låses opp rett etter gåten, så hun tar bildet mens de fortsatt sitter sammen.
**Suksessmelding:** «To av favorittmenneskene mine på ett bilde.»
**Filmrull-tekst:** «Lunsj med mamma.»

### Oppgave 7 — «Emoji-minnet» · `QUESTION` med `choices` · etter oppgave 6
**Spørsmål:** «🏃‍♀️✈️💨 ⏳⏳⏳ ❌ 🥛 🛫🛬🛫🛬🛫🛬 🏝️ — hvilken tur var dette?»
Emojiene forteller historien: vi mistet flyet → ventet i timevis → neste fly ble kansellert → melkerute (🥛) → tre fly: Oslo → Madrid → Athen → Samos → endelig øya.
**Alternativer (i denne rekkefølgen):** `Mallorca` · `Samos` · `Island`
**Fasit:** `Samos`
**Hint 1:** «Vi så flere flyplasser enn strender den første dagen.»
**Suksessmelding:** «Oslo – Madrid – Athen – Samos. Den lengste veien til en strand noensinne. Og jeg ville tatt hver eneste mellomlanding igjen, så lenge det var med deg.»

### Oppgave 8 — «Lillegutts bilde» · `PHOTO` · etter oppgave 7
**Utfordring:** «Gi telefonen til lillegutt. I dag er han fotografen — la ham ta et bilde av deg, akkurat sånn han ser deg.»
Kan tas hjemme eller på vei til middag — det viktigste er at det er lillegutt som holder telefonen. Skjeve, uskarpe bilder er helt ok, det er poenget.
**Suksessmelding:** «Sånn ser han deg. Og sånn ser jeg deg også.»
**Filmrull-tekst:** «Mamma, sett med lillegutts øyne.»

### Oppgave 9 — «Hele gjengen» · `PHOTO` · etter oppgave 8
**Utfordring:** «Se deg rundt på bordet. Alle her er her for deg. Be kelneren ta et bilde av hele familien — og ingen får slippe unna.»
Tas på middagsrestauranten — bordet er bestilt 18:00.
**Suksessmelding:** «Alle favorittmenneskene dine på ett bilde. Og du i midten, der du hører hjemme.»
**Filmrull-tekst:** «Bursdagsmiddag med dem som elsker deg.»

### Oppgave 10 — «Den siste låsen» · `QUESTION` · 🔒 18:15
**Spørsmål:**
> Jeg er myk når vi begynner, og hard når vi er ferdige.
> Jeg blir til kopper, skåler og ting du aldri kaster.
> Jeg trenger vann, tålmodighet — og blir aller finest når fire hender former meg sammen.
> Hva er jeg?

Gåten peker rett mot gaven (keramikkurs for to) uten å avsløre den.
**Fasit:** `leire` — godta også `leira`, `leiren`, `clay`
**Hint 1:** «Du kan forme meg med hendene.»
**Hint 2:** «L _ _ _ _ (5 bokstaver)»
**Suksessmelding:** «Leire. Husk det ordet — og trykk på gaven.»

---

## 8. Finalen

1. **Filmrullen.** Bildene fra oppgave 2, 4, 6, 8 og 9 spilles av som polaroider med bildetekstene over, mens en sang spiller. Ca. 25–30 sekunder. Rekkefølgen følger dagen: lillegutt → sommeren → lunsj med mamma → lillegutts bilde → familiemiddag.
2. **Gaveesken.** Gullgave som gynger. «Trykk for å åpne.»
3. **Avsløringen.** Konfetti → stemningsbilde av hender i leire → **Keramikkurs for oss to** → en siste melding fra Ollie:
   > Du har formet hele livet mitt uten å prøve.
   > Nå vil jeg se deg forme noe med hendene — og sitte ved siden av deg mens du gjør det.
   > Vi skal på keramikkurs, bare du og jeg. Gratulerer med dagen, Regine.

   Under meldingen: **Tirsdag 13. oktober · kl. 18–21** · `[sted]`

---

## 9. Byggerekkefølge

Du har fire dager. Bygg i denne rekkefølgen — hvert steg gir noe som fungerer:

1. **Dag 1:** Next.js-oppsett, Prisma-schema, seed med alle 10 oppgaver, kodeinnlogging, stien + tekstoppgaver som fungerer ende-til-ende.
2. **Dag 2:** S3-opplasting, bildeoppgaver, hint, tidslåsing, admin-siden.
3. **Dag 3:** Visuell polering — konfetti, animasjoner, finalen. Dette er der gaven faktisk bor.
4. **Dag 4:** Docker Compose, deploy bak proxy med HTTPS, **test hele løpet på hennes telefonmodell**, og lås innholdet.

**Det som må testes på ekte iPhone før du er ferdig:** kameraopplasting, at Spotify-lenken åpner appen og ikke nettleseren, at PWA-ikonet ser riktig ut, og at appen ikke låser seg ute hvis hun mister nett midt i en opplasting.

**Én ting til:** sett `ACCESS_CODE` til noe hun aldri gjetter feil — datoen dere ble sammen. Og send henne lenken kvelden før, ikke om morgenen. Da våkner hun til den.
