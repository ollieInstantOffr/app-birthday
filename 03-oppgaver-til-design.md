# Bursdagsjakten — Oppgaver og skjerminnhold til design

> **Til:** Claude Design
> **Hører sammen med:** `01-design-ux-spec.md` (visuell identitet, farger, typografi, bevegelse, skjermmaler)
> **Dette dokumentet:** alt innhold som skal vises i appen — alle 10 oppgaver, tekst for tekst, pluss finalen.
> **Bursdagsbarnet:** Regine · **Fra:** Ollie · **Dato:** fredag 18. september 2026
> All tekst i appen er på norsk. Æ, Ø, Å må rendre riktig.

---

## 1. Endringer fra `01-design-ux-spec.md`

Dette dokumentet gjelder der de to spriker:

| I 01-spec | Nå |
|---|---|
| Skjerm 1: «Gratulerer med dagen, [Navn]» | «Gratulerer med dagen, **Regine**» |
| Skjerm 6: Spotify-embed med albumcover | **Utgår.** Sangoppgaven har ingen embed, ingen lyd og ikke noe sangnavn — bare tekst + svarfelt (se oppgave 3) |
| Aksent Lavendel «tarot/mystikk» | Ingen tarotoppgaver lenger. Lavendel kan brukes til stjerne-elementene i oppgave 5 |
| Skjerm 11: «bilde av gaven» | Gaven er en **opplevelse**: keramikkurs for to. Stemningsbilde i stedet for produktbilde |
| — | **Nye varianter:** flervalgsknapper (oppgave 7), riktig-svar-skjerm med stjernesertifikat (oppgave 5), tidslåst oppgave med nedtelling |

---

## 2. Oppgavetyper og hvilken skjermmal de bruker

| Type | Mal | Innhold i kortet |
|---|---|---|
| **Spørsmål** | Skjerm 4 — tekstsvar | Tittel · spørsmålstekst · stort inputfelt «Skriv svaret her…» · «Sjekk svaret» · «Trenger du et hint?» |
| **Spørsmål med knapper** | Skjerm 4, variant | Tittel · spørsmålstekst · 3 store pilleknapper i stedet for inputfelt · ingen «Sjekk svaret» (trykk = svar) |
| **Bilde** | Skjerm 5 — bildeopplasting | Tittel · utfordringstekst · stiplet opplastingsfelt «Ta bilde» / «Velg fra kamerarull» · forhåndsvisning · «Send inn». Ingen hint |
| **Sang** | Skjerm 4, variant | Tittel · instruksjon i uthevet boks · inputfelt · «Sjekk svaret» · hint. Ingen lydspiller |

**Tilstander for hver oppgave:**
- **Låst (rekkefølge):** perle med gull-hengelås. Tekst hvis trykket: «Løs oppgaven før for å låse opp.»
- **Låst (tid)** — gjelder bare oppgave 1, 5 og 10: forrige oppgave er løst, men klokka er ikke der ennå. Kortet viser nedtelling: «Åpner kl. 13:15» + `01:24:07`.
- **Aktiv:** kortet med innholdet under.
- **Feil svar:** kortet rister, «Ikke helt. Prøv igjen 💗».
- **Hint tilgjengelig:** etter 2 feil forsøk eller 5 minutter. Hint 1 først, hint 2 etter 5 feil forsøk.
- **Løst:** riktig-svar-skjerm (skjerm 7) med personlig melding → perlen på stien fylles. Bildeoppgaver får thumbnail på perlen.

---

## 3. Dagen på én side

| # | Tittel | Type | Åpner | Hvor er hun |
|---|---|---|---|---|
| 1 | Der det begynte | Spørsmål | 07:00 🔒 | Hjemme, morgen |
| 2 | Du og lillegutt | Bilde | Etter 1 | Hjemme, morgen |
| 3 | Sangen vår | Sang | Etter 2 | Hjemme, morgen |
| 4 | Sommeren din | Bilde | Etter 3 | Hvor som helst |
| 5 | Mammas gåte | Spørsmål | 13:15 🔒 | Lunsj med mamma |
| 6 | Lunsj med mamma | Bilde | Etter 5 | Lunsj med mamma |
| 7 | Emoji-minnet | Spørsmål med knapper | Etter 6 | Hvor som helst |
| 8 | Lillegutts bilde | Bilde | Etter 7 | Hjemme, med lillegutt |
| 9 | Hele gjengen | Bilde | Etter 8 | Restaurant, familiemiddag |
| 10 | Den siste låsen | Spørsmål | 18:15 🔒 | Restaurant |
| 🎁 | Finalen | Filmrull + gave | etter 10 | Restaurant |

Stien: 10 perler + gaveeske. **Bare perle 1, 5 og 10 er tidslåst** — marker dem diskret med et lite klokkeslett ved perlen (07:00 · 13:15 · 18:15). Alle andre åpner så snart forrige oppgave er løst. Rekkefølgen gjelder alltid.

---

## 4. De 10 oppgavene

### Oppgave 1 — Der det begynte
- **Type:** Spørsmål · **Åpner:** kl. 07:00 🔒
- **Tekst i kortet:**
  > Alt starter et sted. Skriv navnet på stedet der vi møttes for aller første gang.
- **Input:** tekstfelt
- **Hint 1:** «Vi spiste noe varmt i en bolle.»
- **Hint 2:** «På Vika. M _ _ _  R _ _ _ _»
- **Riktig svar-melding:**
  > Miso Ramen på Vika. Der begynte alt — og jeg har vært sulten på mer av deg siden.
- *(Fasit, vises aldri: Miso Ramen)*

---

### Oppgave 2 — Du og lillegutt
- **Type:** Bilde · **Åpner:** når oppgave 1 er løst
- **Tekst i kortet:**
  > Finn lillegutt. Ta et bilde av dere to — før dagen har rukket å starte.
- **Input:** kamera / kamerarull
- **Riktig svar-melding:**
  > Det bildet skal vi ha på veggen.
- **Filmrull-tekst:** «Bursdagsmorgen med lillegutt.»

---

### Oppgave 3 — Sangen vår
- **Type:** Sang · **Åpner:** når oppgave 2 er løst
- **Tekst i kortet:**
  > Det finnes én sang som gjør at jeg tenker på deg hver gang. Jeg ser den som vår sang.
- **Uthevet instruksjonsboks:**
  > Sett den på, hopp til **1:25** og hør etter ordet.
- **Design:** ingen albumcover, ingen sangtittel, ingen Spotify-knapp — hun skal selv vite hvilken sang det er. Et lite musikknote-ikon eller lydbølge-dekor er fint.
- **Input:** tekstfelt
- **Hint 1:** «Justin Bieber.»
- **Hint 2:** «Daisies. Han sier ordet tre ganger på rad: C _ _ _ _ _.»
- **Riktig svar-melding:**
  > Closer. Det er alt jeg vil — nærmere deg, hver eneste dag.
- *(Fasit, vises aldri: closer)*

---

### Oppgave 4 — Sommeren din
- **Type:** Bilde · **Åpner:** når oppgave 3 er løst
- **Tekst i kortet:**
  > Last opp favorittbildet ditt fra i sommer. Bare ett. Velg godt.
- **Input:** kamerarull er hovedvalget her — «Velg fra kamerarull» kan være primær
- **Riktig svar-melding:**
  > Jeg visste du ville velge det.
- **Filmrull-tekst:** «Sommeren 2026.»

---

### Oppgave 5 — Mammas gåte ⭐ *(dagens største øyeblikk)*
- **Type:** Spørsmål · **Åpner:** kl. 13:15 🔒 (og når oppgave 4 er løst)
- **Tekst i kortet:**
  > Denne gåten har ikke jeg. Mamma har den. Spør henne pent — og skriv svaret her.
- **Design:** selve gåten står **ikke** i appen — den ligger på et fysisk kort moren gir henne. Kortet i appen kan hinte om det med et lite konvolutt-ikon.
- **Input:** tekstfelt
- **Hint 1:** «Ordet står ikke i teksten. Det er bygget av bokstaver.»
- **Hint 2:** «Se på siste bokstav i hver setning.»
- *(Fasit, vises aldri: Regine)*

**Riktig svar — egen, utvidet skjerm (stjerneavsløringen):**
Denne skal ikke bruke den vanlige riktig-svar-malen. Den er en liten finale midt på dagen.

1. **Del 1 — navnet.** Lys bakgrunn. «Regine» i Fraunces, stort. Under:
   > Alt jeg er glad i, staver navnet ditt.
2. **Del 2 — himmelen.** Overgang til dyp nattehimmel (mørk plomme/lilla, stjernedryss, lavendel og champagne-gull). Én stjerne tennes og lyser svakt.
   > Og det står skrevet et sted til: på himmelen.
   >
   > Fra i dag finnes det en stjerne som heter Regine. Den lyser hver eneste natt, enten du ser den eller ikke, og den kommer til å lyse lenge etter at vi har sluttet å telle bursdager.
   >
   > Den er for svak til å se med bare øynene. Men den er der, i Jomfruen — og jeg skal vise deg hvor.
   >
   > Gratulerer med dagen. ✨
3. **Del 3 — sertifikatet.** Bilde av stjernesertifikatet (`/public/star/sertifikat.jpg` — mørkt sertifikat med en rosa/lilla hjerteformet tåke og navnet «Regine»), vist som et kort med 20px radius. Under: et lite datakort:

   | | |
   |---|---|
   | Navn | Regine |
   | Stjernebilde | Jomfruen (Virgo) |
   | Posisjon | RA 14h 18m 41,2s · Dec −7° 0′ 49,3″ |
   | Lysstyrke | Magnitude 7,44 |
   | Katalog | HIP 69933 |
   | Registrert | 18. september 2026 · nr. 06BE349F6 |

   Primærknapp: **«Neste oppgave»**.

**Det fysiske kortet moren gir henne** *(kan designes som print, A6 eller postkort, i samme visuelle stil som appen)*:

> **Ting jeg er glad i**
>
> Jeg er glad i sene sommerkvelder der vi blir sittende ute til himmelen blir mørk, fordi ingen av oss vil at dagen skal være over.
> Jeg er glad i at noen husker de små tingene, som hvordan jeg liker kaffen min og hva jeg var nervøs for i forrige uke.
> Jeg er glad i å se en liten gutt sovne trygt inntil mammaen sin, og få være en del av det hver eneste dag.
> Jeg er glad i et menneske som gir og gir, og likevel alltid har mer omsorg, mer latter og mer energi.
> Jeg er glad i at det finnes én person som gjør at alt kjennes som å komme hjem igjen.
> Og jeg er glad i å vite at det fineste jeg har, lyser like sterkt enten jeg er nær eller langt borte.
>
> Det er gjemt et ord i denne lista. Det står også skrevet et helt annet sted.
> Finn det, og skriv det i appen.
>
> — Ollie

**Viktig for kortdesignet:** løsningen er siste bokstav i hver setning (R-E-G-I-N-E). Ikke uthev, fargelegg eller linjejuster sluttbokstavene på noen måte — hun skal ikke se mønsteret. Venstrejustert tekst, ujevn høyremarg.

---

### Oppgave 6 — Lunsj med mamma
- **Type:** Bilde · **Åpner:** når oppgave 5 er løst
- **Tekst i kortet:**
  > Ta et bilde av deg og mamma — begge må smile.
- **Input:** kamera / kamerarull
- **Riktig svar-melding:**
  > To av favorittmenneskene mine på ett bilde.
- **Filmrull-tekst:** «Lunsj med mamma.»

---

### Oppgave 7 — Emoji-minnet
- **Type:** Spørsmål med knapper · **Åpner:** når oppgave 6 er løst
- **Tekst i kortet:**
  > Hvilken tur var dette?
- **Emoji-rad** (stor, egen linje over spørsmålet, kan brytes over to linjer):
  > 🏃‍♀️✈️💨 ⏳⏳⏳ ❌ 🥛 🛫🛬🛫🛬🛫🛬 🏝️
- **Knapper (i denne rekkefølgen):** `Mallorca` · `Samos` · `Island`
- **Feil knapp:** knappen rister og blir dempet/overstreket, de andre står igjen.
- **Hint 1:** «Vi så flere flyplasser enn strender den første dagen.»
- **Riktig svar-melding:**
  > Oslo – Madrid – Athen – Samos. Den lengste veien til en strand noensinne. Og jeg ville tatt hver eneste mellomlanding igjen, så lenge det var med deg.
- **Designidé til riktig-svar-skjermen:** en liten stiplet flyrute Oslo → Madrid → Athen → Samos med fire prikker.
- *(Fasit, vises aldri: Samos)*

---

### Oppgave 8 — Lillegutts bilde
- **Type:** Bilde · **Åpner:** når oppgave 7 er løst
- **Tekst i kortet:**
  > Gi telefonen til lillegutt. I dag er han fotografen — la ham ta et bilde av deg, akkurat sånn han ser deg.
- **Input:** kamera / kamerarull
- **Riktig svar-melding:**
  > Sånn ser han deg. Og sånn ser jeg deg også.
- **Filmrull-tekst:** «Mamma, sett med lillegutts øyne.»

---

### Oppgave 9 — Hele gjengen
- **Type:** Bilde · **Åpner:** når oppgave 8 er løst
- **Tekst i kortet:**
  > Se deg rundt på bordet. Alle her er her for deg. Be kelneren ta et bilde av hele familien — og ingen får slippe unna.
- **Input:** kamera / kamerarull
- **Riktig svar-melding:**
  > Alle favorittmenneskene dine på ett bilde. Og du i midten, der du hører hjemme.
- **Filmrull-tekst:** «Bursdagsmiddag med dem som elsker deg.»

---

### Oppgave 10 — Den siste låsen
- **Type:** Spørsmål · **Åpner:** kl. 18:15 🔒 (og når oppgave 9 er løst)
- **Tekst i kortet** (vises som et lite dikt, fire linjer):
  > Jeg er myk når vi begynner, og hard når vi er ferdige.
  > Jeg blir til kopper, skåler og ting du aldri kaster.
  > Jeg trenger vann, tålmodighet — og blir aller finest når fire hender former meg sammen.
  > Hva er jeg?
- **Input:** tekstfelt
- **Hint 1:** «Du kan forme meg med hendene.»
- **Hint 2:** «L _ _ _ _ (5 bokstaver)»
- **Riktig svar-melding:**
  > Leire. Husk det ordet — og trykk på gaven.
- **Knapp:** i stedet for «Neste oppgave»: **«Åpne gaven»** (champagne-gull) → går til finalen. Gaveesken nederst på stien tennes.
- *(Fasit, vises aldri: leire)*

---

## 5. Finalen

### Del 1 — Filmrullen
- Mørk, varm bakgrunn (`#3B1B29`), som i skjerm 10 i 01-spec.
- Fem polaroider flyr inn én og én og legger seg i en bunke, ~5 sek hver, tapp for å gå videre.
- Rekkefølge og bildetekster (håndskrift-følelse under hvert bilde):

| # | Bilde fra | Bildetekst |
|---|---|---|
| 1 | Oppgave 2 | Bursdagsmorgen med lillegutt. |
| 2 | Oppgave 4 | Sommeren 2026. |
| 3 | Oppgave 6 | Lunsj med mamma. |
| 4 | Oppgave 8 | Mamma, sett med lillegutts øyne. |
| 5 | Oppgave 9 | Bursdagsmiddag med dem som elsker deg. |

- Etter siste bilde: «Og nå — gaven din.» → overgang til del 2.

### Del 2 — Gaveesken
- Lys gradient. Gullgaveeske med sløyfe som gynger svakt.
- Tekst: «Trykk for å åpne».

### Del 3 — Avsløringen
- Esken sprenger i konfetti.
- **Stemningsbilde:** to par hender i våt leire på en dreieskive, varmt lys, gjerne i rosa/terrakotta-toner.
- **Tittel** (Fraunces 34px): **Keramikkurs for oss to**
- **Melding fra Ollie** (kursiv Fraunces):
  > Du har formet hele livet mitt uten å prøve.
  > Nå vil jeg se deg forme noe med hendene — og sitte ved siden av deg mens du gjør det.
  > Vi skal på keramikkurs, bare du og jeg. Gratulerer med dagen, Regine.
- **Detaljkort** under meldingen (som en billett / invitasjon):
  > 🗓 Tirsdag 13. oktober
  > 🕕 Kl. 18–21
  > 📍 [sted]
- Helt nederst: **«Gratulerer med dagen, elskede»** — ingen knapp. Siste skjerm.

---

## 6. Hva som skal designes — prioritert

1. **Stien** med alle 10 perler, tidsmarkeringer og gaveesken (bruk titlene over)
2. **Oppgavekort, spørsmål** — oppgave 1 som eksempel
3. **Riktig svar** — oppgave 1 som eksempel
4. **Stjerneavsløringen** — oppgave 5, alle tre delene
5. **Finalen** — gaveesken og keramikkurs-avsløringen
6. **Oppgavekort, bilde** — oppgave 2, før og etter valgt bilde
7. **Oppgavekort, sang** — oppgave 3
8. **Oppgavekort, knapper** — oppgave 7, inkl. feil-tilstand
9. **Tidslåst kort** — oppgave 5 kl. 12:40 med nedtelling til 13:15
10. **Filmrullen**
11. **Hint-ark** — oppgave 5, hint 1
12. **Låst / nedtelling før 07:00** og **velkomst**
13. **Det fysiske kortet** til oppgave 5 (print, A6)
