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
 *
 * Step 10, not the bare hue. The bare token is the scale's tint step, which in
 * light mode lands somewhere around #95f3d9 for cyan — a 2px box in that colour
 * on a white screenshot is invisible, and a mark nobody can see is a mark
 * nobody answers. Step 10 is the scale's solid step: legible on the page in
 * light mode, and a light tint of the same hue in dark mode.
 */
export const ACCEPTANCE_AUTHOR_COLORS = [
  cssVar.geekblue10,
  cssVar.magenta10,
  cssVar.gold10,
  cssVar.cyan10,
  cssVar.purple10,
  cssVar.lime10,
  cssVar.orange10,
  cssVar.blue10,
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
