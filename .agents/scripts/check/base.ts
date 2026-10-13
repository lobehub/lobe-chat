import { run } from './exec';
import { getConfig, mountDir } from './paths';
import { resolveMount } from './routing';
import type { RepoMount } from './types';

/** A selected file resolved against its mount's merge base with the configured base ref. */
export interface BaseLocation {
  baseCommit: string;
  baseRef: string;
  mount: RepoMount;
  subPath: string;
}

/**
 * Resolve files to their mount's merge base, computing each merge base once.
 * Returns undefined when the mount has no base ref or the base is unavailable
 * locally: base-dependent checks are best-effort and skip instead of failing.
 */
export const createBaseLocator = () => {
  const mergeBases = new Map<RepoMount, Promise<string | undefined>>();

  return async (file: string): Promise<BaseLocation | undefined> => {
    const { mount, subPath } = resolveMount(getConfig().repos, file);
    if (!mount.baseRef) return;

    let mergeBase = mergeBases.get(mount);
    if (!mergeBase) {
      mergeBase = run('git', ['merge-base', 'HEAD', mount.baseRef], mountDir(mount)).then(
        (result) => (result.code === 0 ? result.stdout.trim() || undefined : undefined),
      );
      mergeBases.set(mount, mergeBase);
    }

    const baseCommit = await mergeBase;
    if (!baseCommit) return;

    return { baseCommit, baseRef: mount.baseRef, mount, subPath };
  };
};
