import type { SkillResourceTreeNode } from '@lobechat/types';
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

/** One version's `SKILL.md` as kept — frontmatter included, as the skill viewer shows it. */
export const skillVersionContent = (
  versions: readonly { content: string; version: number }[] | null | undefined,
  revision: number,
): string | undefined => (versions ?? []).find((version) => version.version === revision)?.content;

/**
 * A skill's files as the file tree takes them: `scripts/check.sh` becomes a
 * `scripts` folder holding `check.sh`. Folders first, then files, by name.
 */
export const skillFileTree = (
  files: readonly { content: string; path: string }[] | null | undefined,
): SkillResourceTreeNode[] => {
  const root: SkillResourceTreeNode[] = [];
  for (const file of files ?? []) {
    const parts = file.path.split('/').filter(Boolean);
    let level = root;
    parts.forEach((name, index) => {
      const path = parts.slice(0, index + 1).join('/');
      if (index === parts.length - 1) {
        level.push({ content: file.content, name, path, type: 'file' });
        return;
      }
      let folder = level.find((node) => node.type === 'directory' && node.name === name);
      if (!folder) {
        folder = { children: [], name, path, type: 'directory' };
        level.push(folder);
      }
      level = folder.children!;
    });
  }
  const sort = (nodes: SkillResourceTreeNode[]): SkillResourceTreeNode[] =>
    nodes
      .map((node) => (node.children ? { ...node, children: sort(node.children) } : node))
      .sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1,
      );
  return sort(root);
};
