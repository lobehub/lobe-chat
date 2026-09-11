import { cssVar } from 'antd-style';

/**
 * Marks drawn on evidence need to say WHO drew them at a glance: two reviewers
 * circling the same screenshot in one colour read as one person's notes. Each
 * author gets a stable hue from the design system's preset scale, so the box on
 * the image, the ring on their avatar and the marker badge always agree.
 *
 * Theme tokens rather than raw hexes, so the marks follow light/dark like every
 * other surface. The semantic hues are deliberately absent: `volcano` is
 * `colorError` and `green` is `colorSuccess`, and a person's box wearing either
 * would read as a verdict on the evidence rather than as an author.
 */
export const ACCEPTANCE_AUTHOR_COLORS = [
  cssVar.geekblue,
  cssVar.magenta,
  cssVar.gold,
  cssVar.cyan,
  cssVar.purple,
  cssVar.lime,
  cssVar.orange,
  cssVar.blue,
] as const;

/** Deterministic, order-independent: the same author keeps their colour across rounds and reloads. */
export const acceptanceAuthorColor = (authorUserId?: string | null): string => {
  if (!authorUserId) return ACCEPTANCE_AUTHOR_COLORS[0];
  let hash = 0;
  for (let index = 0; index < authorUserId.length; index++) {
    hash = (hash * 31 + authorUserId.codePointAt(index)!) >>> 0;
  }
  return ACCEPTANCE_AUTHOR_COLORS[hash % ACCEPTANCE_AUTHOR_COLORS.length];
};
