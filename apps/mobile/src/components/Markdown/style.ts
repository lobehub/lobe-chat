import { useCallback } from 'react';
import { Platform } from 'react-native';

import { useThemeToken } from '@/theme';

import type { RemarkStyles } from './context';

export type RemarkStyleOptions = {
  fontSize: number;
  headerMultiple: number;
  lineHeight: number;
  marginMultiple: number;
};

export const useRemarkStyles = (options: RemarkStyleOptions): RemarkStyles => {
  const token = useThemeToken();

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

  return {
    blockquote: {
      borderLeftColor: token.colorBorder,
      borderLeftWidth: 4,
      marginVertical: options.fontSize * options.marginMultiple * 0.5,
      paddingHorizontal: options.fontSize,
    },
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
    footnoteReference: {
      color: '#8b949e',
      fontSize: options.fontSize * 0.875,
      marginBlockStart: options.fontSize * options.marginMultiple,
    },
    heading: heading(),
    image: {
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius,
      borderWidth: 1,
      marginBlock: options.fontSize * options.marginMultiple * 0.5,
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
    text: {
      // 从 父节点继承
      // color: token.colorText
    },
    thematicBreak: {
      borderColor: token.colorBorder,
      borderStyle: 'dashed',
      borderWidth: 0.5,
      marginBlock: options.fontSize * options.marginMultiple * 1.5,
      width: '100%',
    },
    tr: {
      borderColor: token.colorBorderSecondary,
      flexDirection: 'row',
    },
  };
};
