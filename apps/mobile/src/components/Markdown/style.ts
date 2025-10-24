import { useCallback } from 'react';

import { useTheme } from '@/components/styles';

import type { RemarkStyles } from './context';

export type RemarkStyleOptions = {
  fontSize: number;
  headerMultiple: number;
  lineHeight: number;
  marginMultiple: number;
};

export const useRemarkStyles = (options: RemarkStyleOptions): RemarkStyles => {
  const theme = useTheme();

  const heading = useCallback(() => {
    return (level: number) => {
      const mapping = [0, 1.5, 1, 0.5, 0.25, 0, 0];
      const multiple = mapping[level] ?? 0;
      const size = options.fontSize * (1 + multiple * options.headerMultiple);
      return {
        color: theme.colorTextHeading,
        fontSize: size,
        fontWeight: 'bold',
        lineHeight: 1.25 * size,
        marginVertical: options.fontSize * options.marginMultiple * 0.4,
      } as const;
    };
  }, [options.fontSize, options.headerMultiple, options.marginMultiple, theme]);

  const tdth = {
    color: theme.colorText,
    fontSize: options.fontSize,
    minWidth: 120,
    paddingBlock: options.fontSize * 0.75,
    paddingInline: options.fontSize,
  };

  return {
    blockCode: {
      borderColor: theme.colorBorder,
      marginVertical: options.fontSize * options.marginMultiple * 0.25,
    },
    blockQuote: {
      borderLeftColor: theme.colorBorder,
      borderLeftWidth: 4,
      marginVertical: options.fontSize * options.marginMultiple * 0.5,
      paddingInline: options.fontSize,
    },
    blockQuoteColor: theme.colorTextSecondary,
    borderColor: theme.colorBorder,
    break: {
      pointerEvents: 'none',
    },
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
      color: theme.colorText,
      fontFamily: theme.fontFamilyCode,
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
      pointerEvents: 'none',
    },
    listItem: {
      flex: 1,
    },
    listMarkerColor: theme.colorInfo,
    paragraph: {
      color: theme.colorText,
      fontSize: options.fontSize,
      letterSpacing: 0.02 * options.fontSize,
      lineHeight: options.lineHeight * options.fontSize,
      marginVertical: options.fontSize * options.marginMultiple * 0.16,
      pointerEvents: 'none',
    },
    strong: {
      color: theme.colorTextHeading,
      fontWeight: theme.fontWeightStrong,
    },
    table: {
      borderColor: theme.colorBorder,
      marginVertical: options.fontSize * options.marginMultiple * 0.5,
    },
    td: tdth,
    text: {
      fontSize: options.fontSize,
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
      pointerEvents: 'none',
      width: '100%',
    },
    tr: {
      borderColor: theme.colorBorder,
    },
  };
};
