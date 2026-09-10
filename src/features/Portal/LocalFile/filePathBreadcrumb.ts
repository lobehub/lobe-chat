/** Marks the elided middle of a path that was too deep to show in full. */
export const BREADCRUMB_ELLIPSIS = '\u2026';

/**
 * Beyond this the crumbs stop being scannable and start being a wall, so the
 * middle collapses. Counts the ellipsis itself, matching what a reader sees.
 */
const MAX_CRUMBS = 4;

const splitPath = (filePath: string): string[] =>
  filePath.split(/[/\\]+/).filter((segment) => segment.length > 0);

const isInside = (pathSegments: string[], rootSegments: string[]): boolean =>
  rootSegments.length > 0 &&
  pathSegments.length > rootSegments.length &&
  rootSegments.every((segment, index) => pathSegments[index] === segment);

/**
 * Turn a file path into breadcrumb segments.
 *
 * Anchored on the project root when the file lives inside it, so a preview
 * reads `project › src › index.ts` instead of repeating the machine's home
 * directory on every tab. A path outside the root keeps its own segments.
 */
export const toBreadcrumbSegments = (filePath: string, rootPath?: string): string[] => {
  const pathSegments = splitPath(filePath);
  if (pathSegments.length === 0) return [];

  const rootSegments = rootPath ? splitPath(rootPath) : [];
  const segments = isInside(pathSegments, rootSegments)
    ? [rootSegments.at(-1)!, ...pathSegments.slice(rootSegments.length)]
    : pathSegments;

  if (segments.length <= MAX_CRUMBS) return segments;

  // Keep the anchor and the two crumbs that locate the file; everything between
  // them is what a reader skips anyway.
  return [segments[0], BREADCRUMB_ELLIPSIS, ...segments.slice(-2)];
};
