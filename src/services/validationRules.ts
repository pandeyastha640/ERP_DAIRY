export function duplicateIdentifierError<T>(
  records: readonly T[],
  identifier: string,
  getIdentifier: (record: T) => string,
  getRecordId: (record: T) => string,
  label: string,
  excludeId?: string
): string | undefined {
  const normalizedIdentifier = identifier.trim().toLocaleLowerCase();
  if (!normalizedIdentifier) return `${label} is required.`;

  const duplicate = records.some(
    (record) =>
      getRecordId(record) !== excludeId &&
      getIdentifier(record).trim().toLocaleLowerCase() === normalizedIdentifier
  );

  return duplicate ? `${label} ${identifier.trim()} already exists.` : undefined;
}

export function validIsoDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}