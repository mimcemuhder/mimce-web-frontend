export type DateSort = 'date-desc' | 'date-asc';
export type TitleSort = 'title-asc' | 'title-desc';
export type CodeSort = 'code-asc';

export type EventSort = DateSort | TitleSort;
export type TrainingSort = DateSort | TitleSort | CodeSort;

const TR_MONTHS: Record<string, number> = {
  ocak: 0, şubat: 1, subat: 1, mart: 2, nisan: 3, mayıs: 4, mayis: 4,
  haziran: 5, temmuz: 6, ağustos: 7, agustos: 7, eylül: 8, eylul: 8,
  ekim: 9, kasım: 10, kasim: 10, aralık: 11, aralik: 11,
};

const titleCollator = new Intl.Collator('tr', { numeric: true, sensitivity: 'base' });
const dateCollator = new Intl.Collator('tr', { numeric: true });

function normalizeText(value: string): string {
  return value.trim().normalize('NFKC');
}

function parseDateValue(date: string): number {
  if (!date) return 0;
  const iso = Date.parse(date);
  if (!Number.isNaN(iso)) return iso;

  const match = date.trim().match(/^(\d{1,2})\s+(\p{L}+)\s+(\d{4})$/u);
  if (match) {
    const monthKey = match[2].toLocaleLowerCase('tr-TR').normalize('NFD').replace(/\p{M}/gu, '');
    const month = TR_MONTHS[monthKey];
    if (month !== undefined) {
      return new Date(Number(match[3]), month, Number(match[1])).getTime();
    }
  }

  return 0;
}

function compareDates(a: string, b: string, ascending: boolean): number {
  const diff = parseDateValue(a) - parseDateValue(b);
  if (diff !== 0) return ascending ? diff : -diff;
  return ascending
    ? dateCollator.compare(normalizeText(a), normalizeText(b))
    : dateCollator.compare(normalizeText(b), normalizeText(a));
}

function compareTitle(a: string, b: string, ascending: boolean): number {
  const result = titleCollator.compare(normalizeText(a), normalizeText(b));
  return ascending ? result : -result;
}

function sortWith<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  return [...items].sort(compare);
}

export function sortEvents<T extends { date: string; title: string }>(items: T[], sort: EventSort): T[] {
  switch (sort) {
    case 'date-desc':
      return sortWith(items, (a, b) => compareDates(a.date, b.date, false));
    case 'date-asc':
      return sortWith(items, (a, b) => compareDates(a.date, b.date, true));
    case 'title-asc':
      return sortWith(items, (a, b) => compareTitle(a.title, b.title, true));
    case 'title-desc':
      return sortWith(items, (a, b) => compareTitle(a.title, b.title, false));
    default:
      return sortWith(items, (a, b) => compareDates(a.date, b.date, false));
  }
}

export function sortTrainings<T extends { date: string; title: string; code: string }>(
  items: T[],
  sort: TrainingSort,
): T[] {
  switch (sort) {
    case 'date-desc':
      return sortWith(items, (a, b) => compareDates(a.date, b.date, false));
    case 'date-asc':
      return sortWith(items, (a, b) => compareDates(a.date, b.date, true));
    case 'title-asc':
      return sortWith(items, (a, b) => compareTitle(a.title, b.title, true));
    case 'title-desc':
      return sortWith(items, (a, b) => compareTitle(a.title, b.title, false));
    case 'code-asc':
      return sortWith(items, (a, b) => compareTitle(a.code ?? '', b.code ?? '', true));
    default:
      return sortWith(items, (a, b) => compareDates(a.date, b.date, false));
  }
}

export const EVENT_SORT_OPTIONS: { value: EventSort; label: string }[] = [
  { value: 'date-desc', label: 'Tarih: Yeni → Eski' },
  { value: 'date-asc', label: 'Tarih: Eski → Yeni' },
  { value: 'title-asc', label: 'Başlık: A → Z' },
  { value: 'title-desc', label: 'Başlık: Z → A' },
];

export const TRAINING_SORT_OPTIONS: { value: TrainingSort; label: string }[] = [
  { value: 'date-desc', label: 'Tarih: Yeni → Eski' },
  { value: 'date-asc', label: 'Tarih: Eski → Yeni' },
  { value: 'title-asc', label: 'Başlık: A → Z' },
  { value: 'title-desc', label: 'Başlık: Z → A' },
  { value: 'code-asc', label: 'Kod: A → Z' },
];
