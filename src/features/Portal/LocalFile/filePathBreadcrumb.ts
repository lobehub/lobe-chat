export interface BreadcrumbSegment {
  /** Display name of this level. */
  name: string;
  /** Absolute path this level points at. */
  path: string;
  /**
   * Path relative to the project root, `''` for the root crumb itself, and
   * `undefined` when the file sits outside the root and has no index behind it.
   */
  relativePath?: string;
}

/** One entry of the project file index, narrowed to what a crumb menu needs. */
export interface BreadcrumbEntry {
  isDirectory: boolean;
  name: string;
  path: string;
  relativePath: string;
}

const splitPath = (filePath: string): string[] =>
  filePath.split(/[/\\]+/).filter((segment) => segment.length > 0);

const isInside = (pathSegments: string[], rootSegments: string[]): boolean =>
  rootSegments.length > 0 &&
  pathSegments.length > rootSegments.length &&
  rootSegments.every((segment, index) => pathSegments[index] === segment);

/**
 * Turn a file path into breadcrumb levels.
 *
 * Anchored on the project root when the file lives inside it, so a preview
 * reads `project › src › index.ts` instead of repeating the machine's home
 * directory on every tab. Every level is returned — the row narrows by
 * ellipsizing individual crumbs, so nothing is dropped while there is room.
 */
export const toBreadcrumbSegments = (filePath: string, rootPath?: string): BreadcrumbSegment[] => {
  const pathSegments = splitPath(filePath);
  if (pathSegments.length === 0) return [];

  const separator = filePath.includes('\\') && !filePath.includes('/') ? '\\' : '/';
  const absolutePrefix = filePath.startsWith('/') ? '/' : '';
  const rootSegments = rootPath ? splitPath(rootPath) : [];

  if (!isInside(pathSegments, rootSegments)) {
    return pathSegments.map((name, index) => ({
      name,
      path: absolutePrefix + pathSegments.slice(0, index + 1).join(separator),
    }));
  }

  const rootAbsolute = absolutePrefix + rootSegments.join(separator);
  const relativeSegments = pathSegments.slice(rootSegments.length);

  return [
    { name: rootSegments.at(-1)!, path: rootAbsolute, relativePath: '' },
    ...relativeSegments.map((name, index) => {
      const relativePath = relativeSegments.slice(0, index + 1).join('/');
      return {
        name,
        path: `${rootAbsolute}${separator}${relativeSegments.slice(0, index + 1).join(separator)}`,
        relativePath,
      };
    }),
  ];
};

/**
 * Immediate children of a directory, read out of the flat project index.
 *
 * Index entries mark a directory with a trailing slash (`src/`), which has to
 * come off before the depth test or every folder reads as a grandchild and only
 * files ever show up.
 */
export const listDirectoryChildren = <T extends BreadcrumbEntry>(
  entries: T[],
  directoryRelativePath: string,
): T[] => {
  const prefix = directoryRelativePath ? `${directoryRelativePath.replace(/\/$/, '')}/` : '';

  return entries
    .filter((entry) => {
      const relativePath = entry.relativePath.replace(/\/$/, '');
      if (!relativePath.startsWith(prefix)) return false;
      const rest = relativePath.slice(prefix.length);
      return rest.length > 0 && !rest.includes('/');
    })
    .sort((a, b) => {
      // Folders first, then case-insensitive by name — the order every file
      // tree in this product already uses.
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
};
