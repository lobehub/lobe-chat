/**
 * One version's `SKILL.md` as a plan skill kept it — frontmatter included, as
 * the document view shows it. A payload without `versions` (an older server)
 * has none to offer, rather than throwing.
 */
export const skillVersionContent = (
  versions: readonly { content: string; version: number }[] | null | undefined,
  revision: number,
): string | undefined => (versions ?? []).find((version) => version.version === revision)?.content;

export interface PlanHeading {
  level: number;
  text: string;
}

/**
 * The headings of a plan's Markdown, in order — the table of contents beside
 * the document. Lines inside code fences are not headings.
 */
export const planHeadings = (markdown: string): PlanHeading[] => {
  const headings: PlanHeading[] = [];
  let fenced = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = /^(#{1,6})\s(.*)$/.exec(line);
    if (!match) continue;
    // A closing run of `#` is decoration, not part of the heading.
    const text = match[2].trim().replace(/\s#+$/, '').trim();
    if (text) headings.push({ level: match[1].length, text });
  }
  return headings;
};
