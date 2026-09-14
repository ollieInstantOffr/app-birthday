import 'server-only';

// Fasit, hint og meldingene som vises etter riktig svar. Sendes aldri til klienten
// før brevet er løst (eller hintet er låst opp).

export interface StarReveal {
  name: string;
  lead: string;
  body: string;
  constellation: string;
  constellationLatin: string;
  catalog: string;
  magnitude: string;
  registered: string;
  registeredLong: string;
  ra: string;
  dec: string;
}

export interface SecretTask {
  id: number;
  accepted?: string[];
  /** exact: hele svaret må stemme. contains: svaret må inneholde fasiten (godtar «Miso Ramen på Vika»). */
  match?: 'exact' | 'contains';
  hint1?: string;
  hint2?: string;
  /** Det store ordet på riktig-skjermen og lappen på snoren. */
  answer?: string;
  message: string;
  route?: string[];
  star?: StarReveal;
}

export const SECRETS: Record<number, SecretTask> = {
  1: {
    id: 1,
    accepted: ['miso'],
    match: 'contains',
    hint1: 'Vi spiste noe varmt i en bolle.',
    hint2: 'På Vika. M _ _ _  R _ _ _ _',
    answer: 'Miso Ramen',
    message: 'Miso Ramen på Vika. Der begynte alt, og jeg har vært sulten på mer av deg siden.',
  },
  2: { id: 2, message: 'Det bildet skal vi ha på veggen.' },
  3: {
    id: 3,
    accepted: ['closer'],
    match: 'exact',
    hint1: 'Justin Bieber.',
    hint2: 'Daisies. Han sier ordet tre ganger på rad: C _ _ _ _ _.',
    answer: 'closer',
    message: 'Closer. Det er alt jeg vil: nærmere deg, hver eneste dag.',
  },
  4: { id: 4, message: 'Jeg visste du ville velge det.' },
  5: {
    id: 5,
    accepted: ['regine'],
    match: 'exact',
    hint1: 'Ordet står ikke i teksten. Det er bygget av bokstaver.',
    hint2: 'Se på siste bokstav i hver setning.',
    answer: 'Regine',
    message: 'Regine. Alt jeg er glad i, staver navnet ditt.',
    star: {
      name: 'Regine',
      lead: 'Fra i dag finnes det en stjerne som heter',
      body: 'Den er for svak til å se med bare øynene. Men den er der, i Jomfruen, og jeg skal vise deg hvor.',
      constellation: 'Jomfruen',
      constellationLatin: 'Virgo',
      catalog: 'HIP 69933',
      magnitude: '7,44',
      registered: '18. sep 2026',
      registeredLong: '18. september 2026',
      ra: '14h 18m 41,2s',
      dec: '−7° 0′ 49,3″',
    },
  },
  6: { id: 6, message: 'To av favorittmenneskene mine på ett bilde.' },
  7: {
    id: 7,
    accepted: ['samos'],
    match: 'contains',
    hint1: 'Vi så flere flyplasser enn strender den første dagen.',
    hint2: 'En gresk øy. S _ _ _ _',
    answer: 'Samos',
    message: 'Den lengste veien til en strand noensinne. Og jeg ville tatt hver eneste mellomlanding igjen, så lenge det var med deg.',
    route: ['Oslo', 'Madrid', 'Athen', 'Samos'],
  },
  8: { id: 8, message: 'Sånn ser han deg. Og sånn ser jeg deg også.' },
  9: { id: 9, message: 'Alle favorittmenneskene dine på ett bilde. Og du i midten, der du hører hjemme.' },
  10: {
    id: 10,
    accepted: ['leire', 'leira', 'leiren', 'clay'],
    match: 'exact',
    hint1: 'Du kan forme meg med hendene.',
    hint2: 'L _ _ _ _ (5 bokstaver)',
    answer: 'Leire',
    message: 'Leire. Husk det ordet, og trykk på gaven.',
  },
};

export const GIFT = {
  title: 'Keramikkurs for oss to',
  message:
    'Du har formet hele livet mitt uten å prøve. Nå vil jeg se deg forme noe med hendene, og sitte ved siden av deg mens du gjør det. Vi skal på keramikkurs, bare du og jeg.',
  day: '13',
  month: 'okt',
  dateLabel: 'Tirsdag 13. oktober',
  time: 'kl. 18–21',
  place: process.env.COURSE_PLACE ?? '',
  image: process.env.GIFT_IMAGE ?? '',
};
