// Data-calendario pura, senza orario. Va usata nei DTO al posto di @IsDateString(),
// che accetterebbe anche datetime completi (es. 2026-07-18T10:00:00Z) capaci di
// aggirare i controlli su weekend/festivi/periodo (isWeekend produrrebbe una data invalida).
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isWeekend(dateIso: string): boolean {
  const day = new Date(`${dateIso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6; // 0=Domenica, 6=Sabato
}

export function enumerateDates(startIso: string, endIso: string): string[] {
  const result: string[] = [];
  const cursor = new Date(`${startIso}T00:00:00Z`);
  const end = new Date(`${endIso}T00:00:00Z`);
  while (cursor.getTime() <= end.getTime()) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}
