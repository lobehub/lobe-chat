export const findNextAvailableTitle = (
  baseTitle: string,
  titleSet: ReadonlySet<string>,
  duplicateSymbol?: string
): string => {
  if (!titleSet.has(baseTitle)) {
    return baseTitle;
  }

  let strippedBase = baseTitle;
  let startCount = 1;

  if (duplicateSymbol) {
    // Regex to match " (copy)" or " (copy 1)"
    const matchWithNumber = baseTitle.match(
      new RegExp(`^(.*?)(\\s${duplicateSymbol}\\s(\\d+))$`),
    );
    const matchWithoutNumber = baseTitle.match(
      new RegExp(`^(.*?)(\\s${duplicateSymbol})$`),
    );

    if (matchWithNumber) {
      strippedBase = matchWithNumber[1];
      startCount = parseInt(matchWithNumber[3], 10) + 1;
    } else if (matchWithoutNumber) {
      strippedBase = matchWithoutNumber[1];
    }

    const noNumberTitle = `${strippedBase} ${duplicateSymbol}`;
    if (!titleSet.has(noNumberTitle) && startCount <= 1) {
      return noNumberTitle;
    }

    while (true) {
      const numberedTitle = `${strippedBase} ${duplicateSymbol} ${startCount}`;
      if (!titleSet.has(numberedTitle)) {
        return numberedTitle;
      }
      startCount++;
    }
  } else {
    const matchWithNumber = baseTitle.match(/^(.*?)(\s(\d+))$/);
    if (matchWithNumber) {
      strippedBase = matchWithNumber[1];
      startCount = parseInt(matchWithNumber[3], 10) + 1;
    }

    while (true) {
      const numberedTitle = `${strippedBase} ${startCount}`;
      if (!titleSet.has(numberedTitle)) {
        return numberedTitle;
      }
      startCount++;
    }
  }
};
