import { t } from 'i18next';

export const findNextAvailableTitle = (
  baseTitle: string,
  titleSet: ReadonlySet<string>,
  duplicateSymbol: string = t('duplicateSymbol', { ns: 'common' }),
): string => {
  if (!titleSet.has(baseTitle)) {
    return baseTitle;
  }

  let strippedBase = baseTitle;
  // Regex to match " (copy)" or " (copy 1)"
  const matchWithNumber = baseTitle.match(
    new RegExp(`^(.*?)(\\s${duplicateSymbol}\\s(\\d+))$`),
  );
  const matchWithoutNumber = baseTitle.match(
    new RegExp(`^(.*?)(\\s${duplicateSymbol})$`),
  );

  let startCount = 1;

  if (matchWithNumber) {
    // e.g., "My Session" from "My Session copy 1"
    strippedBase = matchWithNumber[1];
    startCount = parseInt(matchWithNumber[3], 10) + 1; // Increment the number
  } else if (matchWithoutNumber) {
    // e.g., "My Session" from "My Session copy"
    strippedBase = matchWithoutNumber[1];
  }

  const noNumberTitle = `${strippedBase} ${duplicateSymbol}`;
  if (!titleSet.has(noNumberTitle) && startCount <= 1) {
    return noNumberTitle;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const numberedTitle = `${strippedBase} ${duplicateSymbol} ${startCount}`;
    if (!titleSet.has(numberedTitle)) {
      return numberedTitle;
    }
    startCount++;
  }
};
