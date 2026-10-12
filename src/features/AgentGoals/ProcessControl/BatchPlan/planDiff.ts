import { diffLines } from 'diff';

export interface PlanDiffLine {
  kind: 'added' | 'removed' | 'same';
  text: string;
}

/**
 * Line-level difference between two versions of a batch plan. A revision
 * carries the previous plan forward and appends its own section, so the usual
 * result is the earlier text unchanged and the new section added.
 */
export const planDiff = (before = '', after = ''): PlanDiffLine[] =>
  // Both sides end with a newline, or a last line followed by new text would
  // read as changed rather than kept.
  diffLines(`${before.trim()}\n`, `${after.trim()}\n`).flatMap((part) =>
    part.value
      .replace(/\n$/, '')
      .split('\n')
      .map((text) => ({
        kind: part.added
          ? ('added' as const)
          : part.removed
            ? ('removed' as const)
            : ('same' as const),
        text,
      })),
  );

/** A skill's `SKILL.md` without its frontmatter: the plan as a person reads it. */
export const skillBody = (content: string) =>
  content.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim();

/**
 * One version's plan text from the versions a plan skill kept. A payload
 * without `versions` (an older server) has none to offer, rather than throwing.
 */
export const skillVersionText = (
  versions: readonly { content: string; version: number }[] | null | undefined,
  revision: number,
): string | undefined => {
  const kept = (versions ?? []).find((version) => version.version === revision);
  return kept ? skillBody(kept.content) : undefined;
};
