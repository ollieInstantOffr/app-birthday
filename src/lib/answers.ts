export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

export function isCorrect(value: string, accepted: string[], match: 'exact' | 'contains' = 'exact'): boolean {
  const v = normalize(value);
  if (!v) return false;
  return accepted.some((a) => {
    const n = normalize(a);
    return match === 'contains' ? v.includes(n) : v === n;
  });
}
