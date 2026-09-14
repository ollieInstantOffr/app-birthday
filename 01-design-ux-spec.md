# Bursdagsjakten — Design- og UX-spesifikasjon

> **Til:** Claude Design — underlag for UI/UX-mockups
> **Produkt:** Web-app (mobil-først) som kjøres på iPhone i Safari, lagt til på hjemskjermen som PWA
> **Anledning:** Bursdag 18. september — hun fyller 32
> **Arbeidstittel:** *Bursdagsjakten* (alternativer: «Dagen din», «10 låser», «Rosa Tråd»)

---

## 1. Kort om produktet

En privat, én-brukers skattejakt som varer én dag. Hun logger inn om morgenen, får oppgave 1, løser den, og låser opp neste. Etter 10 oppgaver åpnes finalen: en filmrull av bildene hun har lastet opp gjennom dagen, etterfulgt av avsløringen av bursdagsgaven.

**Designet skal føles som:** en kjærlighetserklæring pakket som et lekent spill. Ikke en app. Ikke et produkt. En gave.

---

## 2. Designprinsipper

1. **Én ting av gangen.** Aldri to valg på samme skjerm. Ett kort, ett svarfelt, én knapp.
2. **Belønning over friksjon.** Hver riktige løsning skal føles fysisk god — konfetti, haptikk, en liten personlig melding fra Ollie.
3. **Aldri en blindvei.** Feil svar straffes ikke. Hint er alltid innen rekkevidde.
4. **Rosa uten å bli barnslig.** Myk, dyr, voksen rosa — tenk Ladurée og Dior-emballasje, ikke Barbie-leketøy.
5. **Tommelvennlig.** All primærinteraksjon i nederste tredjedel av skjermen.

---

## 3. Visuell identitet

### Fargepalett

| Rolle | Navn | Hex | Bruk |
|---|---|---|---|
| Bakgrunn | Blush | `#FFF5F7` | Appbakgrunn, alle skjermer |
| Bakgrunn alt. | Powder | `#FDE7EE` | Gradientbunn, låste seksjoner |
| Primær | Rosa | `#F2679A` | Knapper, aktive tilstander, fremdrift |
| Primær mørk | Deep Rose | `#D94C82` | Trykk-tilstand, lenker |
| Tekst | Plomme | `#4A2233` | All brødtekst og overskrifter |
| Tekst dempet | Mauve | `#8A6273` | Hjelpetekst, tidsstempler |
| Aksent 1 | Lavendel | `#C9A7E8` | Tarot-/mystikk-oppgaver, dekor |
| Aksent 2 | Champagne-gull | `#E4C08A` | Låser, nøkler, finale |
| Suksess | Mint | `#79CFB0` | Riktig svar |
| Kort | Hvit | `#FFFFFF` | Kortflater |

**Gradient (brukes på finale og låseskjerm):** `linear-gradient(180deg, #FFE3EC 0%, #FFF5F7 55%, #F6E7FA 100%)`

### Typografi

- **Display / overskrifter:** `Fraunces` (serif, soft optical, wght 500–600). Brukes til oppgavetitler, tall, finale. Alternativ: `Playfair Display`.
- **Brødtekst / UI:** `Plus Jakarta Sans` (400/500/700). Alternativ: `Nunito`.
- **Skalaen:** Display 34/40, H1 28/34, H2 22/28, Body 17/26, Small 14/20, Caption 12/16.
- Æ, Ø, Å må rendre korrekt — all tekst i appen er på norsk.

### Form og materiale

- **Hjørneradius:** kort 28px, knapper 999px (pille), input 18px, bilder 20px.
- **Skygge:** `0 8px 28px rgba(217, 76, 130, 0.12)` — myk, rosa-tonet, aldri grå.
- **Kanter:** 1px `rgba(242, 103, 154, 0.18)` på hvite kort.
- **Ikoner:** avrundet strek, 1.75px, Phosphor eller Lucide-stil.
- **Dekor:** subtile håndtegnede elementer — stjernedryss, små hjerter, en tynn slyngete «tråd» som binder oppgavene sammen. Sparsomt, aldri clipart.

### Bevegelse

| Hendelse | Animasjon |
|---|---|
| Oppgave låses opp | Gullås spretter opp, kortet folder seg ut nedover (400ms, spring) |
| Riktig svar | Konfetti i rosa/gull/lavendel 1.5s + haptisk «success» + kortet glir vekk til venstre |
| Feil svar | Kortet rister horisontalt 300ms, inputkant blir Deep Rose, mykt haptisk «warning» |
| Fremdrift | Perlen på stien fylles med rosa, venstre-til-høyre, 600ms |
| Finale | Bildene flyr inn ett og ett som polaroider som legger seg i en bunke |

---

## 4. Skjermer som skal mockes opp

Lag alle artboards i **iPhone 15 Pro-format: 393 × 852 px**, med status bar og home indicator.

### Skjerm 1 — Låst / før kl. 07:00
- Full gradient-bakgrunn.
- Sentrert: stort gulllåsikon som pulserer svakt.
- Display-tekst: «Gratulerer med dagen, [Navn]».
- Under: «Dagen din åpner klokken 07:00.» + en levende nedtelling `04:12:33`.
- Ingen knapp. Ingenting å trykke på. Ren forventning.

### Skjerm 2 — Velkomst (første gang appen åpnes)
- En konvolutt-animasjon som åpner seg.
- Kort med håndskrevet-følelse: en kort hilsen fra Ollie (3–4 linjer).
- Primærknapp i pilleform, full bredde minus 24px margin: **«Start dagen min»**.

### Skjerm 3 — Hjem / Stien *(kjerneskjerm)*
- Toppfelt: «Oppgave 4 av 10» + en tynn fremdriftslinje.
- Hoveddelen: en vertikal, slynget **sti** med 10 perler/sirkler. Scrollbar.
  - **Løst:** rosa fylt sirkel med hvit hake + en liten thumbnail hvis oppgaven hadde bildeopplasting.
  - **Aktiv:** større sirkel, hvit med rosa ring som roterer svakt, tallet synlig.
  - **Låst:** blek Powder-sirkel med et lite gull-hengelås.
- Perle 10 erstattes av en **gaveeske i gull** nederst på stien.
- Nederst, festet: primærknapp **«Åpne oppgave 4»**.

### Skjerm 4 — Oppgavekort: tekstsvar *(hovedmal)*
- Kortet fyller ~75 % av skjermen, hvitt, radius 28.
- Øverst i kortet: oppgavenummer i Fraunces 34px, i Champagne-gull.
- Oppgavetittel (H2) + selve gåten (Body, maks 60 ord).
- Inputfelt: stort, sentrert tekst, placeholder «Skriv svaret her…».
- Primærknapp: **«Sjekk svaret»**.
- Tekstlenke under: «Trenger du et hint?» (dempet Mauve, aktiveres først etter 2 feil forsøk eller 5 minutter).
- Tilbakepil øverst til venstre → tilbake til stien.

### Skjerm 5 — Oppgavekort: bildeopplasting
- Samme kortmal, men i stedet for input: et stort stiplet opplastingsfelt med kamera-ikon.
- Tekst: «Ta bilde» / «Velg fra kamerarull».
- Etter valg: forhåndsvisning i 20px radius, med «Bytt bilde»-lenke.
- Primærknapp: **«Send inn»**.

### Skjerm 6 — Oppgavekort: Spotify / lytteoppgave
- Kortmal med et **innebygd Spotify-kort**: albumcover, sangtittel, artist.
- Tydelig instruksjon i uthevet boks: «Hopp til **1:24** og hør etter ordet.»
- Knapp sekundær: **«Åpne i Spotify»** (grønn tekst på hvit, eneste sted grønt brukes).
- Under: samme svarfelt som skjerm 4.

### Skjerm 7 — Riktig svar
- Fullskjerm konfetti-overlegg.
- Stor mint-hake i sirkel.
- Display: «Riktig!»
- Under: en personlig melding fra Ollie knyttet til nettopp den oppgaven (2–3 linjer, i kursiv Fraunces).
- Primærknapp: **«Neste oppgave»**.

### Skjerm 8 — Feil svar (tilstand, ikke egen side)
- Inputkanten blir Deep Rose, kortet rister.
- Under feltet: «Ikke helt. Prøv igjen 💗» i Deep Rose, 14px.
- Etter 2. forsøk: hint-lenken lyser opp.

### Skjerm 9 — Hint-ark (bottom sheet)
- Halvhøyt ark som glir opp, radius 28 topp, Powder-bakgrunn.
- «Hint» i Fraunces + hintteksten.
- Lukkeknapp i pilleform: «Ok, jeg prøver igjen».

### Skjerm 10 — Finale, del 1: Filmrullen
- Mørkere, varm bakgrunn (`#3B1B29`) for kontrast — eneste mørke skjerm i appen.
- Bildene hun har lastet opp gjennom dagen kommer inn som polaroider, ett og ett, med en kort bildetekst fra Ollie.
- Automatisk avspilling, ~3 sek per bilde, med mulighet til å tappe videre.
- Musikknote-ikon øverst: en sang spiller i bakgrunnen.

### Skjerm 11 — Finale, del 2: Gaven
- Tilbake til lys gradient.
- Stor gullgaveeske med sløyfe, midt på skjermen, som gynger svakt.
- Tekst under: «Trykk for å åpne».
- **Åpnet tilstand:** esken sprenger i konfetti → avsløringskort med bilde av gaven, navnet på gaven i Fraunces 34px, og en avsluttende melding fra Ollie.
- Nederst: **«Gratulerer med dagen, elskede»** — ingen knapp. Dette er siste skjerm.

### Skjerm 12 — Admin (kun Ollie, lav prioritet for mockup)
- Enkel, nøktern liste over de 10 oppgavene med status, tidspunkt løst, antall forsøk, og thumbnails av innsendte bilder.
- Trenger ikke samme designomsorg — funksjonell er nok.

---

## 5. Tilstandsoversikt per oppgave

```
LÅST  →  AKTIV  →  (FEIL → HINT TILGJENGELIG)  →  LØST
```

Kun **én** oppgave kan være aktiv om gangen. Løste oppgaver kan åpnes igjen i lesemodus (svaret vises, ikke redigerbart) — hun skal kunne bla tilbake gjennom dagen.

---

## 6. Tilgjengelighet og praktisk

- Minimum treffområde 48 × 48 px.
- Kontrast: Plomme på Blush = 11:1. Aldri rosa tekst på rosa bakgrunn under 16px.
- Fungerer i portrettmodus kun. Ingen landskapsvisning.
- Tåler dårlig nett: opplastede bilder får optimistisk UI med spinner.
- PWA: eget ikon (gullås på rosa gradient), splash screen, `display: standalone`, tema-farge `#F2679A`.

---

## 7. Hva Claude Design skal levere

Prioritert rekkefølge for artboards:

1. Skjerm 3 — Hjem / Stien (definerer hele visuelle språket)
2. Skjerm 4 — Oppgavekort, tekstsvar
3. Skjerm 7 — Riktig svar
4. Skjerm 11 — Finale, gaven
5. Skjerm 1 — Låst / nedtelling
6. Skjerm 5 og 6 — Bilde- og Spotify-oppgave
7. Skjerm 10 — Filmrullen
8. Skjerm 9 — Hint-ark
9. Skjerm 2 — Velkomst

Legg dem ut som én sammenhengende flyt på lerretet, venstre mot høyre, med piler mellom.
