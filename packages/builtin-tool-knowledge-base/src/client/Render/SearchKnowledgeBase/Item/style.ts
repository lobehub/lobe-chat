import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  badge: {
    paddingBlock: '4px',
    paddingInline: '6px',
    borderRadius: '2222px',
    fontSize: '12px',
    lineHeight: '12px',
    color: cssVar.colorTextSecondary,
    backgroundColor: cssVar.colorFillSecondary,
    backgroundImage: 'none',
  },

  container: {
    cursor: 'pointer',
    width: 'fit-content',
    paddingBlock: '6px',
    paddingInlineStart: '8px',
    paddingInlineEnd: '12px',
    borderRadius: '8px',
    color: cssVar.colorText,
    backgroundColor: `color-mix(in srgb, ${cssVar.colorBgElevated} 90%, white)`,
    backgroundImage: 'none',
    boxShadow: {
      'default': cssVar.boxShadowTertiary,
      ':hover': cssVar.boxShadowSecondary,
    },
    transitionProperty: 'all',
    transitionDuration: '0.2s',
  },
  containerDark: {
    backgroundColor: {
      'default': null,
      ':hover': `color-mix(in srgb, ${cssVar.colorBgElevated} 85%, white)`,
    },
  },
  containerLight: {
    backgroundColor: {
      'default': null,
      ':hover': `color-mix(in srgb, ${cssVar.colorBgElevated} 90%, white)`,
    },
  },
  filename: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '1',
    fontSize: '12px',
    textOverflow: 'ellipsis',
  },

  mobile: { width: '100%' },
});
