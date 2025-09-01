import { useCallback } from 'react';
import { Platform } from 'react-native';

import { useTheme, useThemeToken } from '@/theme';

import type { RemarkStyles } from './context';

export type RemarkStyleOptions = {
  fontSize: number;
  headerMultiple: number;
  lineHeight: number;
  marginMultiple: number;
};

export const useRemarkStyles = (options: RemarkStyleOptions): RemarkStyles => {
  const token = useThemeToken();
  const { theme } = useTheme();

  const heading = useCallback(() => {
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

  const tdth = {
    color: token.colorText,
    fontSize: options.fontSize,
    minWidth: 120,
    paddingHorizontal: options.fontSize,
    paddingVertical: options.fontSize * 0.75,
  };

  return {
    blockCode: {
      marginVertical: options.fontSize * options.marginMultiple * 0.25,
    },
    blockQuote: {
      borderLeftColor: token.colorBorder,
      borderLeftWidth: 4,
      marginVertical: options.fontSize * options.marginMultiple * 0.5,
      paddingHorizontal: options.fontSize,
    },
    blockQuoteColor: token.colorTextTertiary,
    borderColor: token.colorBorder,
    break: {},
    container: { flex: 1 },
    delete: {
      color: token.colorTextDescription,
      textDecorationLine: 'line-through',
    },
    emphasis: {
      fontStyle: 'italic',
    },
    fontSize: options.fontSize,
    footnoteReference: {
      color: '#8b949e',
      fontSize: options.fontSize * 0.875,
      marginVertical: options.fontSize * options.marginMultiple * 0.5,
    },
    heading: heading(),
    image: {
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius,
      borderWidth: 1,
      marginVertical: options.fontSize * options.marginMultiple * 0.25,
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
      marginInlineStart: options.fontSize * options.marginMultiple * 0.5,
    },
    listItem: {
      flex: 1,
    },
    listMarkerColor: theme.isDark ? token.cyan9A : token.cyan11A,
    paragraph: {
      color: token.colorText,
      letterSpacing: 0.02 * options.fontSize,
      lineHeight: options.lineHeight * options.fontSize,
      // marginVertical: options.fontSize * options.marginMultiple * 0.33,
      marginVertical: 4,
    },
    strong: {
      color: token.colorTextHeading,
      fontWeight: token.fontWeightStrong,
    },
    table: {
      backgroundColor: token.colorFillQuaternary,
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius,
      marginVertical: options.fontSize * options.marginMultiple * 0.5,
    },
    td: tdth,
    text: {
      // 从 父节点继承,否则一些样式带不下来
      // color: token.colorText
    },
    textColor: token.colorText,
    th: tdth,
    thead: {
      backgroundColor: token.colorFillQuaternary,
    },
    thematicBreak: {
      borderColor: token.colorBorder,
      borderStyle: 'dashed',
      borderWidth: 0.5,
      marginVertical: options.fontSize * options.marginMultiple * 0.75,
      width: '100%',
    },
    tr: {
      borderColor: token.colorBorder,
    },
  };
};
