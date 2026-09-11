import { cssVar, useThemeMode } from 'antd-style';
import { useCallback } from 'react';

/**
 * Marks drawn on evidence need to say WHO drew them at a glance: two reviewers
 * circling the same screenshot in one colour read as one person's notes. Each
 * author gets a stable hue from the design system's preset scale, so the box on
 * the image, the ring on their avatar and the marker badge always agree.
 *
 * Theme tokens rather than raw hexes, and a different STEP per theme. The
 * scale's steps are not symmetrical: step 10 is the solid, readable tone on a
 * light page (cyan lands near #2fa28a) but a near-white tint on a dark one
 * (#bdf7e4), which glows over a dark screenshot. Step 7 is the solid tone at
 * the dark end (#55bca4). Picking per theme is what keeps one mark equally
 * legible and equally quiet in both.
 *
 * The semantic hues are deliberately absent: `volcano` is `colorError` and
 * `green` is `colorSuccess`, and a person's box wearing either would read as a
 * verdict on the evidence rather than as an author.
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

/** Same hues, one step in from the light end — the dark page's readable tone. */
export const ACCEPTANCE_AUTHOR_COLORS_DARK = [
  cssVar.geekblue7,
  cssVar.magenta7,
  cssVar.gold7,
  cssVar.cyan7,
  cssVar.purple7,
  cssVar.lime7,
  cssVar.orange7,
  cssVar.blue7,
] as const;

/** Deterministic, order-independent: the same author keeps their colour across rounds and reloads. */
const authorSlot = (authorUserId?: string | null): number => {
  if (!authorUserId) return 0;
  let hash = 0;
  for (let index = 0; index < authorUserId.length; index++) {
    hash = (hash * 31 + authorUserId.codePointAt(index)!) >>> 0;
  }
  return hash % ACCEPTANCE_AUTHOR_COLORS.length;
};

export const acceptanceAuthorColor = (
  authorUserId?: string | null,
  appearance: 'dark' | 'light' = 'light',
): string =>
  (appearance === 'dark' ? ACCEPTANCE_AUTHOR_COLORS_DARK : ACCEPTANCE_AUTHOR_COLORS)[
    authorSlot(authorUserId)
  ];

/** The same mapping, bound to the theme the reader is actually looking at. */
export const useAcceptanceAuthorColor = () => {
  const { isDarkMode } = useThemeMode();
  return useCallback(
    (authorUserId?: string | null) =>
      acceptanceAuthorColor(authorUserId, isDarkMode ? 'dark' : 'light'),
    [isDarkMode],
  );
};
