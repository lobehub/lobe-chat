import React, { useMemo, useState, useEffect } from 'react';
import { Image, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Markdown } from './Remark';

import Highlighter from '@/components/Highlighter';
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
  const { width } = useWindowDimensions();
  const token = useThemeToken();
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});

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
          width: width - token.paddingContentHorizontal * 2,
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
    [fontSize, marginMultiple, lineHeight, token, width],
  );

  const calculateImageHeight = (uri: string, callback: (height: number) => void) => {
    if (imageHeights[uri]) {
      callback(imageHeights[uri]);
      return;
    }

    Image.getSize(
      uri,
      (w, h) => {
        const scaledHeight = (h / w) * (width - token.paddingContentHorizontal * 2);
        setImageHeights((prev) => ({ ...prev, [uri]: scaledHeight }));
        callback(scaledHeight);
      },
      () => {
        // Error fallback
        callback(200);
      },
    );
  };

  const RenderImage: React.FC<{ key: string; src: string }> = ({ src, key }) => {
    const [height, setHeight] = useState(200);

    useEffect(() => {
      calculateImageHeight(src, setHeight);
    }, [src]);

    return (
      <Image
        key={key}
        resizeMode="contain"
        source={{ uri: src }}
        style={[styles.image, { height }]}
      />
    );
  };

  // Custom renderers for react-native-remark
  const customRenderers = useMemo(
    () => ({
      CodeBlockRenderer: ({ node }: any) => {
        const language = node.lang || '';
        const code = node.value || '';

        return (
          <Highlighter
            allowChangeLanguage
            code={code.trim()}
            fullFeatured
            lang={language}
            style={{ marginVertical: 8 }}
            type="compact"
          />
        );
      },
      ImageRenderer: ({ node }: any) => {
        const src = node.url || '';
        return <RenderImage key={src} src={src} />;
      },
    }),
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      <Markdown customRenderers={customRenderers} customStyles={styles} markdown={content} />
    </View>
  );
};

export default MarkdownRender;
