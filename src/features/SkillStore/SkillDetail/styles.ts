import * as stylex from '@stylexjs/stylex';

export const ICON_SIZE = 56;

const compiled = stylex.create({});

// Consumers pass these to `className` props of other components, so they are exported as
// compiled class names.
export const styles = Object.fromEntries(
  Object.entries(compiled).map(([key, style]) => [key, stylex.props(style).className]),
) as Record<keyof typeof compiled, string>;
