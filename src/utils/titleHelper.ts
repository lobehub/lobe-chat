export const findNextAvailableTitle = (
  baseTitle: string,
  titleSet: ReadonlySet<string>,
  duplicateSymbol?: string,
): string => {
  if (!titleSet.has(baseTitle)) return baseTitle;

  let strippedBase = baseTitle;
  let startCount = 1;

  if (duplicateSymbol) {
    const matchWithNumber = baseTitle.match(new RegExp(`^(.*?)(\\s${duplicateSymbol}\\s(\\d+))$`));
    const matchWithoutNumber = baseTitle.match(new RegExp(`^(.*?)(\\s${duplicateSymbol})$`));

    if (matchWithNumber) {
      strippedBase = matchWithNumber[1];
      startCount = parseInt(matchWithNumber[3], 10) + 1;
    } else if (matchWithoutNumber) {
      strippedBase = matchWithoutNumber[1];
    }

    const noNumberTitle = `${strippedBase} ${duplicateSymbol}`;
    if (!titleSet.has(noNumberTitle) && startCount <= 1) return noNumberTitle;

    for (let i = startCount; ; i++) {
      const numberedTitle = `${strippedBase} ${duplicateSymbol} ${i}`;
      if (!titleSet.has(numberedTitle)) return numberedTitle;
    }
  }

  const matchWithNumber = baseTitle.match(/^(.*?)(\s(\d+))$/);
  if (matchWithNumber) {
    strippedBase = matchWithNumber[1];
    startCount = parseInt(matchWithNumber[3], 10) + 1;
  }

  for (let i = startCount; ; i++) {
    const numberedTitle = `${strippedBase} ${i}`;
    if (!titleSet.has(numberedTitle)) return numberedTitle;
  }
};
