import { darken } from 'polished';
import { useContext } from 'react';

import { createStyles } from '@/components';
import { useMarkdownContext } from '@/components/Markdown/components';

import { BlockContext, BlockType } from './components/context';

export type styleOptions = {
  fontSize: number;
  headerMultiple: number;
  lineHeight: number;
  marginMultiple: number;
};

export const useMarkdownStyles = createStyles(
  ({ token, isDarkMode }, options: styleOptions, blockType: BlockType) => {
    const isHeading = blockType.startsWith('h');
    const heading = (level: number) => {
      const mapping = [0, 1.5, 1, 0.5, 0.25, 0, 0];
      const multiple = mapping[level] ?? 0;
      const size = options.fontSize * (1 + multiple * options.headerMultiple);
      return {
        fontSize: size,
        lineHeight: 1.25 * size,
        marginBlock: size * options.marginMultiple * 0.4,
      };
    };

    const getFontSize = () => {
      if (!isHeading) return options.fontSize;
      const level = parseInt(blockType.replace('h', ''));
      return heading(level).fontSize!;
    };

    const currentFontSize = getFontSize();

    return {
      blockquote: {
        borderLeftColor: token.colorBorder,
        borderLeftWidth: 4,
        paddingLeft: options.fontSize,
      },
      code: {
        backgroundColor: token.colorFillTertiary,
        fontFamily: token.fontFamilyCode,
        fontSize: currentFontSize * 0.875,
        lineHeight: currentFontSize * options.lineHeight * 0.875,
      },
      codeBlock: {
        marginBlock: options.fontSize * options.marginMultiple * 0.4,
      },
      del: {
        color: token.colorTextDescription,
      },
      div: {},
      em: {
        fontStyle: 'italic',
      },
      hardbreak: {
        height: 1,
        width: '100%',
      },
      heading: {
        fontWeight: 'bold',
      },
      heading1: heading(1),
      heading2: heading(2),
      heading3: heading(3),
      heading4: heading(4),
      heading5: heading(5),
      heading6: heading(6),
      hr: {
        backgroundColor: '#000000',
        height: 1,
      },
      img: {},
      ins: {
        textDecorationLine: 'underline',
      },
      link: {
        color: token.colorInfo,
      },
      list: {
        marginBlock: options.fontSize * options.marginMultiple * 0.4,
        paddingStart: options.fontSize / 2,
      },
      listItem: {
        alignItems: 'flex-start',
        flex: 1,
        flexDirection: 'row',
        gap: options.fontSize / 2,
      },
      listNested: {
        marginLeft: options.fontSize / 2,
      },
      listOrderedIcon: {
        color: isDarkMode ? token.cyan : darken(0.3, token.cyan),
      },
      listUnorderedIcon: {
        color: token.colorTextDescription,
      },
      mathBlock: {
        marginBlock: options.fontSize * options.marginMultiple * 0.4,
      },
      paragraph: {
        color: blockType === 'blockquote' ? token.colorTextSecondary : token.colorText,
        letterSpacing: 0.02 * options.fontSize,
        marginBlock:
          blockType === 'blockquote' ? 0 : options.fontSize * options.marginMultiple * 0.2,
      },
      pre: {},

      strikethrough: {
        textDecorationLine: 'line-through',
      },
      strong: {
        fontWeight: 'bold',
      },
      sub: {
        fontSize: currentFontSize * 0.75,
        transform: [{ translateY: currentFontSize * 0.6 }],
      },
      sup: {
        fontSize: currentFontSize * 0.75,
        transform: [{ translateY: currentFontSize * 0.3 }],
      },
      table: {
        backgroundColor: token.colorFillQuaternary,
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
        borderWidth: 1,
        overflow: 'hidden',
      },
      tableBody: {},
      tableHeader: {
        backgroundColor: token.colorFillQuaternary,
      },
      tableHeaderCell: {
        fontWeight: 'bold',
        paddingBlock: currentFontSize * 0.75,
        paddingInline: currentFontSize,
        textAlign: 'left',
        width: 150,
      },
      tableRow: {
        borderBottomWidth: 1,
        borderColor: token.colorBorderSecondary,
        flexDirection: 'row',
      },
      tableRowCell: {
        paddingBlock: currentFontSize * 0.75,
        paddingInline: currentFontSize,
        width: 150,
      },
      text: {
        color: blockType === 'blockquote' ? token.colorTextSecondary : token.colorText,
        fontFamily: token.fontFamily,
        fontSize: currentFontSize,
        fontWeight: isHeading ? 'bold' : 'normal',
        lineHeight: options.lineHeight * options.fontSize,
      },
    };
  },
);

export const useStyles = () => {
  const { fontSize, headerMultiple, lineHeight, marginMultiple } = useMarkdownContext();
  const { type } = useContext(BlockContext);
  return useMarkdownStyles(
    {
      fontSize: fontSize || 14,
      headerMultiple: headerMultiple || 0.25,
      lineHeight: lineHeight || 1.6,
      marginMultiple: marginMultiple || 1,
    },
    type,
  );
};
