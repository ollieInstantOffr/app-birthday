// Tekstene som vises i brevene. Ingen fasit, hint eller suksessmeldinger her —
// dette importeres av klienten. Hemmelighetene ligger i ./secret.ts.

export type TaskKind = 'question' | 'photo' | 'song';
export type Tone = 'rose' | 'lavender' | 'gold';

export interface PublicTask {
  id: number;
  kind: TaskKind;
  tone: Tone;
  title: string;
  eyebrow: string;
  prompt: string;
  /** Tidslås på dagen, "HH:MM" (Oslo). */
  unlockTime?: string;
  inputLabel?: string;
  placeholder?: string;
  /** Bildebrev: tekst i opplastingsfeltet. */
  uploadTitle?: string;
  uploadSub?: string;
  /** Bildebrev: knappetekst før bilde er valgt. */
  pickCta?: string;
  /** Bildebrev: åpne kameraet direkte i stedet for å la henne velge. */
  preferRoll?: boolean;
  /** Bildetekst på postkortet i finalen. */
  caption?: string;
  /** Kort merkelapp på snoren. */
  short: string;
}

export const TASKS: PublicTask[] = [
  {
    id: 1,
    kind: 'question',
    tone: 'rose',
    title: 'Der det begynte',
    short: 'Der det begynte',
    eyebrow: 'Morgen · kl. 07:00',
    unlockTime: '07:00',
    prompt: 'Alt starter et sted. Skriv navnet på stedet der vi møttes for aller første gang.',
    inputLabel: 'Svaret ditt',
    placeholder: 'skriv stedet her…',
  },
  {
    id: 2,
    kind: 'photo',
    tone: 'lavender',
    title: 'Du og lillegutt',
    short: 'Du og lillegutt',
    eyebrow: 'Morgen · bilde',
    prompt: 'Finn lillegutt. Ta et bilde av dere to, før dagen har rukket å starte.',
    uploadTitle: 'Ta bilde',
    uploadSub: 'eller velg fra kamerarull',
    caption: 'Bursdagsmorgen med lillegutt',
  },
  {
    id: 3,
    kind: 'song',
    tone: 'rose',
    title: 'Sangen vår',
    short: 'Sangen vår',
    eyebrow: 'Morgen · lytt',
    prompt:
      'Det finnes én sang som gjør at jeg tenker på deg hver gang. Jeg ser den som vår sang. Sett den på, hopp til 1:25 og hør etter ordet.',
    inputLabel: 'Ordet',
    placeholder: 'bare ett ord…',
  },
  {
    id: 4,
    kind: 'photo',
    tone: 'lavender',
    title: 'Sommeren din',
    short: 'Sommeren din',
    eyebrow: 'Morgen · bilde',
    prompt: 'Last opp favorittbildet ditt fra i sommer. Bare ett. Velg godt.',
    uploadTitle: 'Velg fra kamerarull',
    uploadSub: 'bare ett',
    preferRoll: true,
    caption: 'Sommeren 2026',
  },
  {
    id: 5,
    kind: 'question',
    tone: 'rose',
    title: 'Ting jeg er glad i',
    short: 'ting jeg er glad i',
    eyebrow: 'Lunsj med mamma · kl. 13:15',
    unlockTime: '13:15',
    prompt: 'Her trenger vi litt hjelp. Spør din mor — kanskje hun har noe informasjon. Skriv svaret her.',
    inputLabel: 'Svaret ditt',
    placeholder: 'skriv ordet her…',
  },
  {
    id: 6,
    kind: 'photo',
    tone: 'lavender',
    title: 'Lunsj med mamma',
    short: 'Lunsj med mamma',
    eyebrow: 'Lunsj med mamma · bilde',
    prompt: 'Ta et bilde av deg og mamma. Begge må smile.',
    uploadTitle: 'Ta bilde',
    uploadSub: 'begge må smile',
    caption: 'Lunsj med mamma',
  },
  {
    id: 7,
    kind: 'question',
    tone: 'rose',
    title: 'Emoji-minnet',
    short: 'Emoji-minnet',
    eyebrow: 'Ettermiddag · gåte',
    prompt: 'hvilken tur var dette?',
    inputLabel: 'Svaret ditt',
    placeholder: 'skriv stedet her…',
  },
  {
    id: 8,
    kind: 'photo',
    tone: 'lavender',
    title: 'Lillegutts bilde',
    short: 'Lillegutts bilde',
    eyebrow: 'Ettermiddag · bilde',
    prompt: 'Gi telefonen til lillegutt. I dag er han fotografen. La ham ta et bilde av deg, akkurat sånn han ser deg.',
    uploadTitle: 'Fotograf: lillegutt',
    pickCta: 'Gi telefonen til lillegutt',
    caption: 'Mamma, sett med lillegutts øyne',
  },
  {
    id: 9,
    kind: 'photo',
    tone: 'lavender',
    title: 'Hele gjengen',
    short: 'Hele gjengen',
    eyebrow: 'Kveld · bord kl. 18 · bilde',
    prompt:
      'Se deg rundt på bordet. Alle her er her for deg. Be kelneren ta et bilde av hele familien — og ingen får slippe unna.',
    uploadTitle: 'Be kelneren ta bildet',
    uploadSub: 'du i midten',
    caption: 'Bursdagsmiddag',
  },
  {
    id: 10,
    kind: 'question',
    tone: 'gold',
    title: 'Den siste låsen',
    short: 'Den siste låsen',
    eyebrow: 'Kveld · kl. 18:15 · gåte',
    unlockTime: '18:15',
    prompt:
      'Jeg er myk når vi begynner, og hard når vi er ferdige.\nJeg blir til kopper, skåler og ting du aldri kaster.\nJeg trenger vann, tålmodighet, og blir aller finest når fire hender former meg sammen.\nHva er jeg?',
    inputLabel: 'Svaret ditt',
    placeholder: 'skriv ordet her…',
  },
];

export const taskById = (id: number) => TASKS.find((t) => t.id === id);

/** Bildebrevene i den rekkefølgen de vises i finalen. */
export const FINALE_PHOTO_TASKS = [2, 4, 6, 8, 9];

export const PLAYER_NAME = 'Regine';
export const SIGNATURE = 'OP';
