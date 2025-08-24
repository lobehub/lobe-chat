import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Markdown } from './Remark';

import { useThemeToken } from '@/theme';

interface MarkdownRenderProps {
  content: string;
  fontSize?: number;
  headerMultiple?: number;
  lineHeight?: number;
  marginMultiple?: number;
}

const MarkdownRender: React.FC<MarkdownRenderProps> = ({
  content,
  fontSize = 16,
  headerMultiple = 1,
  marginMultiple = 2,
  lineHeight = 1.8,
}) => {
  const token = useThemeToken();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // react-native-remark 样式
        blockquote: {
          backgroundColor: token.colorFillQuaternary,
          borderLeftColor: token.colorPrimaryBorder,
          borderLeftWidth: 4,
          borderRadius: token.borderRadiusSM,
          color: token.colorTextSecondary,
          marginVertical: fontSize * marginMultiple,
          paddingHorizontal: token.paddingSM,
          paddingVertical: token.paddingXS,
        },
        body: {
          color: token.colorText,
          fontSize,
          maxWidth: '100%',
          width: '100%',
        },
        code_block: {
          backgroundColor: token.colorBgContainer,
          borderColor: token.colorBorderSecondary,
          borderRadius: token.borderRadius,
          borderWidth: 1,
          fontFamily: Platform.select({ android: 'monospace', ios: 'Menlo' }),
          fontSize: fontSize * 0.875,
          marginVertical: token.marginMD,
          overflow: 'hidden',
          padding: 0,
        },
        heading1: {
          color: token.colorTextHeading,
          fontSize: fontSize * (1 + 1.5 * headerMultiple),
          fontWeight: token.fontWeightStrong,
          lineHeight: 1.25 * fontSize * (1 + 1.5 * headerMultiple),
          marginVertical: fontSize * marginMultiple * 0.4,
        },
        heading2: {
          color: token.colorTextHeading,
          fontSize: fontSize * (1 + headerMultiple),
          fontWeight: token.fontWeightStrong,
          lineHeight: 1.25 * fontSize * (1 + headerMultiple),
          marginVertical: fontSize * marginMultiple * 0.4,
        },
        heading3: {
          color: token.colorTextHeading,
          fontSize: fontSize * (1 + 0.5 * headerMultiple),
          fontWeight: token.fontWeightStrong,
          lineHeight: 1.25 * fontSize * (1 + 0.5 * headerMultiple),
          marginVertical: fontSize * marginMultiple * 0.4,
        },
        heading4: {
          color: token.colorTextHeading,
          fontSize: fontSize * (1 + 0.25 * headerMultiple),
          fontWeight: token.fontWeightStrong,
          lineHeight: 1.25 * fontSize * (1 + 0.25 * headerMultiple),
          marginVertical: fontSize * marginMultiple * 0.4,
        },
        heading5: {
          color: token.colorTextHeading,
          fontSize: fontSize,
          fontWeight: token.fontWeightStrong,
          marginVertical: fontSize * marginMultiple * 0.4,
        },
        heading6: {
          color: token.colorTextHeading,
          fontSize: fontSize,
          fontWeight: token.fontWeightStrong,
          marginVertical: fontSize * marginMultiple * 0.4,
        },
        hr: {
          borderBottomWidth: 1,
          borderColor: token.colorBorderSecondary,
          borderStyle: 'dashed',
          marginVertical: token.marginLG,
        },
        // 自定义样式
        image: {
          borderColor: token.colorBorderSecondary,
          borderRadius: token.borderRadius,
          borderWidth: 1,
          marginVertical: token.marginMD,
        },

        inlineCode: {
          backgroundColor: token.colorFillSecondary,
          borderColor: token.colorFillQuaternary,
          borderRadius: token.borderRadius,
          borderWidth: 1,
          color: token.colorText,
          fontFamily: Platform.select({ android: 'monospace', ios: 'Menlo' }),
          fontSize: fontSize * 0.875,
          marginHorizontal: token.marginXXS,
          paddingHorizontal: token.paddingXXS,
          paddingVertical: token.paddingXXS,
        },

        link: {
          color: token.colorLink,
          textDecorationLine: 'none',
        },

        list: {
          marginVertical: token.marginXS,
        },

        listItem: {
          marginVertical: token.marginXS,
        },
        ordered_list: {
          marginVertical: token.marginXS,
        },

        paragraph: {
          color: token.colorText,
          letterSpacing: 0.2,
          lineHeight: lineHeight * fontSize,
          marginVertical: token.marginMD,
        },

        strong: {
          color: token.colorTextHeading,
          fontWeight: token.fontWeightStrong,
        },

        table: {
          backgroundColor: token.colorBgContainer,
          borderColor: token.colorBorderSecondary,
          borderRadius: token.borderRadius,
          borderWidth: 1,
          marginVertical: token.marginMD,
          overflow: 'hidden',
          unicodeBidi: 'isolate',
        },

        tableCell: {
          color: token.colorText,
          minWidth: 120,
          padding: token.paddingSM,
        },

        tableHeader: {
          backgroundColor: token.colorFillQuaternary,
        },

        tableHeaderCell: {
          color: token.colorTextHeading,
          fontWeight: token.fontWeightStrong,
          minWidth: 120,
          padding: token.paddingSM,
        },

        tableRow: {
          borderBottomWidth: 1,
          borderColor: token.colorBorderSecondary,
        },
      }),
    [fontSize, marginMultiple, lineHeight, token],
  );

  return (
    <View style={{ flex: 1 }}>
      <Markdown customStyles={styles} markdown={content} />
    </View>
  );
};

export default MarkdownRender;
