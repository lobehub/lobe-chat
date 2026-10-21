import * as stylex from '@stylexjs/stylex';
import { type CSSProperties } from 'react';

type StyleArg = stylex.StyleXArray<
  | boolean
  | null
  | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>
  | stylex.CompiledStyles
  | undefined
>;

/**
 * stylex.props for elements that also forward a caller's className / style, which
 * spreading stylex.props cannot do (@stylexjs/no-conflicting-props).
 *
 *   <div {...sx([styles.root, active && styles.active], className, style)} />
 *
 * The caller's className is appended, not merged: StyleX rules carry raised
 * specificity, so a plain class cannot override them. Components that let callers
 * restyle them take an `xstyle?: StyleXStyles` prop and pass it in `styles`.
 */
export const sx = (styles: StyleArg, className?: string, style?: CSSProperties) => {
  const props = stylex.props(styles);
  const mergedClassName = [props.className, className].filter(Boolean).join(' ');
  return {
    className: mergedClassName || undefined,
    style: props.style || style ? { ...props.style, ...style } : undefined,
  };
};
