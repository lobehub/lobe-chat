import { useMemo } from 'react';
import { Platform } from 'react-native';

import { createStyles, useThemeToken } from '@/theme';

import type { RemarkStyles } from './context';

export type RemarkStyleOptions = {
  fontSize: number;
  headerMultiple: number;
  lineHeight: number;
  marginMultiple: number;
};

export const useRemarkStyles = createStyles((token, options: RemarkStyleOptions) => ({
  blockquote: {
    borderLeftColor: token.colorBorder,
    borderLeftWidth: 4,
    color: token.colorTextSecondary,
    marginVertical: options.fontSize * options.marginMultiple * 0.5,
    paddingHorizontal: options.fontSize,
  },
  break: {},
  container: { flex: 1 },
  image: {
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: 1,
    marginVertical: token.marginMD,
  },
  inlineCode: {
    backgroundColor: token.colorFillSecondary,
    color: token.colorText,
    fontFamily: Platform.select({ android: 'monospace', ios: 'Menlo' }),
    fontSize: options.fontSize * 0.875,
  },
  link: {
    color: token.colorLink,
    textDecorationLine: 'none',
  },
  linkReference: {
    color: token.colorLink,
    textDecorationLine: 'none',
  },
  list: {
    marginVertical: token.marginXS,
  },
  listItem: {
    marginVertical: token.marginXS,
  },
  paragraph: {
    color: token.colorText,
    letterSpacing: 0.2,
    lineHeight: options.lineHeight * options.fontSize,
    marginBlock: token.marginXXS,
    marginBlockEnd: options.marginMultiple * 0.5 * options.fontSize,
  },
  strong: {
    color: token.colorTextHeading,
    fontWeight: token.fontWeightStrong,
  },
  tableCell: {
    color: token.colorText,
    minWidth: 120,
    padding: token.paddingSM,
  },
  text: { color: token.colorText },
  thematicBreak: {
    borderBottomWidth: 1,
    borderColor: token.colorBorderSecondary,
    borderStyle: 'dashed',
    marginVertical: token.marginLG,
  },
  tr: {
    borderColor: token.colorBorderSecondary,
    flexDirection: 'row',
  },
}));

export const useHeading = (options: RemarkStyleOptions): NonNullable<RemarkStyles['heading']> => {
  const token = useThemeToken();
  return useMemo(() => {
    return (level: number) => {
      const mapping = [0, 1.5, 1, 0.5, 0.25, 0, 0];
      const multiple = mapping[level] ?? 0;
      const size = options.fontSize * (1 + multiple * options.headerMultiple);
      return {
        color: token.colorTextHeading,
        fontSize: size,
        fontWeight: token.fontWeightStrong,
        lineHeight: 1.25 * size,
        marginVertical: options.fontSize * options.marginMultiple * 0.4,
      } as const;
    };
  }, [options.fontSize, options.headerMultiple, options.marginMultiple, token]);
};
