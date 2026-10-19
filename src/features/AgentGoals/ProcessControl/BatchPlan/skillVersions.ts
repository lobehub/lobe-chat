import type { SkillResourceTreeNode } from '@lobechat/types';

import { useClientDataSWR } from '@/libs/swr';
import { userSkillService } from '@/services/userSkill';

/**
 * One version of a skill as it shipped — its `SKILL.md` and the files beside
 * it — read from its archive on demand. A version never changes, so it is
 * fetched once and shared by every view that reads it.
 */
export const useSkillVersion = (skillId: string | undefined, version: number | undefined) =>
  useClientDataSWR(
    skillId && version ? ['user-skill-version', skillId, version] : null,
    () => userSkillService.getVersion(skillId!, version!),
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  );

/**
 * A skill's files as the file tree takes them: `scripts/check.sh` becomes a
 * `scripts` folder holding `check.sh`. Folders first, then files, by name.
 * `SKILL.md` itself is the tree's root entry, not one of these.
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
