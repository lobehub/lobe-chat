export interface TocHeading {
  element: HTMLElement;
  level: 1 | 2 | 3;
  text: string;
}

const HEADING_SELECTOR = 'h1, h2, h3';

/**
 * The page body is the first Lexical root inside the editor content; later roots
 * belong to the comment composers rendered below it.
 */
export const findBodyRoot = (content: ParentNode | null | undefined): HTMLElement | null =>
  content?.querySelector<HTMLElement>('[data-lexical-editor]') ?? null;

export const collectHeadings = (root: ParentNode | null | undefined): TocHeading[] => {
  if (!root) return [];

  const headings: TocHeading[] = [];

  for (const element of root.querySelectorAll<HTMLElement>(HEADING_SELECTOR)) {
    const text = element.textContent?.trim();
    if (!text) continue;

    headings.push({ element, level: Number(element.tagName[1]) as TocHeading['level'], text });
  }

  return headings;
};

/**
 * Index of the heading whose section is being read: the last heading that has
 * scrolled past `threshold` px below the top of the viewport. Before the first
 * heading is reached, the first one is active.
 */
export const findActiveIndex = (offsets: number[], threshold: number): number => {
  let active = 0;

  for (const [index, offset] of offsets.entries()) {
    if (offset > threshold) break;
    active = index;
  }

  return offsets.length === 0 ? -1 : active;
};
