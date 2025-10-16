const extractFootnoteDefinitions = (content: string): string[] => {
  const footnoteRegex = /^\[\^(\d+)]:\s*(.+)$/gm;
  const matches = content.match(footnoteRegex);
  return matches || [];
};

const extractFootnoteReferences = (content: string): number[] => {
  const referenceRegex = /\[\^(\d+)]/g;
  const matches = content.match(referenceRegex);
  if (!matches) return [];

  return matches
    .map((match) => {
      const numberMatch = match.match(/\[\^(\d+)]/);
      return numberMatch ? parseInt(numberMatch[1], 10) : 0;
    })
    .filter((num) => num > 0);
};

export const processMarkdownForCopy = (content: string): string => {
  const footnoteDefinitions = extractFootnoteDefinitions(content);
  const footnoteReferences = extractFootnoteReferences(content);

  if (footnoteReferences.length === 0) {
    return content;
  }

  const referencedFootnotes = new Set(new Set(footnoteReferences));

  const relevantDefinitions = footnoteDefinitions.filter((def) => {
    const numberMatch = def.match(/^\[\^(\d+)]:/);
    if (!numberMatch) return false;
    const footnoteNumber = parseInt(numberMatch[1], 10);
    return referencedFootnotes.has(footnoteNumber);
  });

  if (relevantDefinitions.length === 0) {
    return content;
  }

  const processedContent = content + '\n\n' + relevantDefinitions.join('\n');

  return processedContent;
};
