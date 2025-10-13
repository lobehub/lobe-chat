import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  // Boolean variant styles
  code: {
    fontFamily: token.fontFamilyCode,
  },

  // Type (semantic color) styles
  danger: {
    color: token.colorError,
  },

  delete: {
    textDecorationLine: 'line-through',
  },

  disabled: {
    color: token.colorTextDisabled,
    cursor: 'not-allowed' as any,
  },

  ellipsis: {
    overflow: 'hidden',
  },

  ellipsisMulti: {
    overflow: 'hidden',
  },

  // Tag/As styles
  h1: {
    fontSize: token.fontSizeHeading1,
    fontWeight: 'bold',
    lineHeight: token.lineHeightHeading1,
  },

  h2: {
    fontSize: token.fontSizeHeading2,
    fontWeight: 'bold',
    lineHeight: token.lineHeightHeading2,
  },

  h3: {
    fontSize: token.fontSizeHeading3,
    fontWeight: 'bold',
    lineHeight: token.lineHeightHeading3,
  },

  h4: {
    fontSize: token.fontSizeHeading4,
    fontWeight: 'bold',
    lineHeight: token.lineHeightHeading4,
  },

  h5: {
    fontSize: token.fontSizeHeading5,
    fontWeight: 'bold',
    lineHeight: token.lineHeightHeading5,
  },

  info: {
    color: token.colorInfo,
  },
  italic: {
    fontStyle: 'italic',
  },
  p: {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  },
  secondary: {
    color: token.colorTextSecondary,
  },
  strong: {
    fontWeight: 'bold',
  },
  success: {
    color: token.colorSuccess,
  },
  text: {
    color: token.colorText,
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
  },

  underline: {
    textDecorationLine: 'underline',
  },
  warning: {
    color: token.colorWarning,
  },
}));
