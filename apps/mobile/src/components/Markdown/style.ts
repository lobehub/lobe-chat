import { useCallback } from 'react';

import { useTheme, useThemeMode } from '@/components/theme';

import type { RemarkStyles } from './context';

export type RemarkStyleOptions = {
  fontSize: number;
  headerMultiple: number;
  lineHeight: number;
  marginMultiple: number;
};

export const useRemarkStyles = (options: RemarkStyleOptions): RemarkStyles => {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();

  const heading = useCallback(() => {
    return (level: number) => {
      const mapping = [0, 1.5, 1, 0.5, 0.25, 0, 0];
      const multiple = mapping[level] ?? 0;
      const size = options.fontSize * (1 + multiple * options.headerMultiple);
      return {
        color: theme.colorTextHeading,
        fontSize: size,
        fontWeight: theme.fontWeightStrong,
        lineHeight: 1.25 * size,
        marginVertical: options.fontSize * options.marginMultiple * 0.4,
      } as const;
    };
  }, [options.fontSize, options.headerMultiple, options.marginMultiple, theme]);

  const tdth = {
    color: theme.colorText,
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
      borderLeftColor: theme.colorBorder,
      borderLeftWidth: 4,
      marginVertical: options.fontSize * options.marginMultiple * 0.5,
      paddingHorizontal: options.fontSize,
    },
    blockQuoteColor: theme.colorTextTertiary,
    borderColor: theme.colorBorder,
    break: {},
    container: { flex: 1 },
    delete: {
      color: theme.colorTextDescription,
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
      borderColor: theme.colorBorder,
      borderRadius: theme.borderRadius,
      borderWidth: 1,
      marginVertical: options.fontSize * options.marginMultiple * 0.25,
    },
    inlineCode: {
      backgroundColor: theme.colorFillSecondary,
      color: theme.colorText,
      fontFamily: theme.fontFamilyCode,
      fontSize: options.fontSize * 0.875,
    },
    link: {
      color: theme.colorLink,
      textDecorationLine: 'none',
    },
    linkReference: {
      color: theme.colorLink,
      textDecorationLine: 'none',
    },
    list: {
      marginInlineStart: options.fontSize * options.marginMultiple * 0.5,
    },
    listItem: {
      flex: 1,
    },
    listMarkerColor: isDarkMode ? theme.cyan9A : theme.cyan11A,
    paragraph: {
      color: theme.colorText,
      letterSpacing: 0.02 * options.fontSize,
      lineHeight: options.lineHeight * options.fontSize,
      marginVertical: options.fontSize * options.marginMultiple * 0.16,
    },
    strong: {
      color: theme.colorTextHeading,
      fontWeight: theme.fontWeightStrong,
    },
    table: {
      backgroundColor: theme.colorFillQuaternary,
      borderColor: theme.colorBorder,
      borderRadius: theme.borderRadius,
      marginVertical: options.fontSize * options.marginMultiple * 0.5,
    },
    td: tdth,
    text: {
      fontSize: options.fontSize,
      // 从 父节点继承,否则一些样式带不下来
      // color: theme.colorText
    },
    textColor: theme.colorText,
    th: tdth,
    thead: {
      backgroundColor: theme.colorFillQuaternary,
    },
    thematicBreak: {
      borderColor: theme.colorBorder,
      borderStyle: 'dashed',
      borderWidth: 0.5,
      marginVertical: options.fontSize * options.marginMultiple * 0.75,
      width: '100%',
    },
    tr: {
      borderColor: theme.colorBorder,
    },
  };
};
