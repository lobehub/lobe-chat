import markdownItMathjax3 from 'markdown-it-mathjax3';
import React, { useMemo, useState, useEffect } from 'react';
import { Image, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

import Highlighter from '@/components/Highlighter';
import { useThemeToken } from '@/theme';

const md = MarkdownIt().use(markdownItMathjax3);

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
  marginMultiple = 1.5,
  lineHeight = 1.8,
}) => {
  const { width } = useWindowDimensions();
  const token = useThemeToken();
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});

  const styles = useMemo(
    () =>
      StyleSheet.create({
        blockquote: {
          backgroundColor: token.colorBgLayout,
          borderLeftColor: token.colorPrimary,
          borderLeftWidth: 4,
          borderRadius: token.borderRadiusSM,
          color: token.colorTextSecondary,
          marginVertical: fontSize * marginMultiple,
          paddingLeft: 16,
          paddingRight: token.paddingSM,
          paddingVertical: token.paddingXS,
        },
        body: {
          color: token.colorText,
          fontSize,
          maxWidth: '100%',
          width: '100%',
        },
        bullet_list: {
          marginVertical: fontSize * marginMultiple * 0.33,
        },
        code_block: {
          backgroundColor: token.colorBgContainer,
          borderColor: token.colorBorder,
          borderRadius: token.borderRadius,
          borderWidth: 1,
          fontFamily: Platform.select({ android: 'monospace', ios: 'Menlo' }),
          fontSize: fontSize * 0.875,
          marginVertical: fontSize * marginMultiple,
          overflow: 'hidden',
          padding: 0,
        },
        code_inline: {
          backgroundColor: token.colorBgElevated,
          borderColor: token.colorBorder,
          borderRadius: token.borderRadiusSM,
          borderWidth: 1,
          color: token.colorTextDescription,
          fontFamily: Platform.select({ android: 'monospace', ios: 'Menlo' }),
          fontSize: fontSize * 0.875,
          marginHorizontal: 4,
          paddingHorizontal: 6,
          paddingVertical: 2,
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
          borderColor: token.colorBorder,
          borderStyle: 'dashed',
          marginVertical: fontSize * marginMultiple * 1.5,
        },
        image: {
          borderColor: token.colorBorder,
          borderRadius: token.borderRadius,
          borderWidth: 1,
          marginVertical: fontSize * marginMultiple,
          width: width - token.padding * 2,
        },
        link: {
          color: token.colorPrimary,
          textDecorationLine: 'none',
        },
        list_item: {
          marginVertical: fontSize * marginMultiple * 0.33,
        },
        ordered_list: {
          marginVertical: fontSize * marginMultiple * 0.33,
        },
        paragraph: {
          color: token.colorText,
          letterSpacing: 0.2,
          lineHeight: lineHeight * fontSize,
          marginVertical: fontSize * marginMultiple,
        },
        strong: {
          color: token.colorTextHeading,
          fontWeight: token.fontWeightStrong,
        },
        table: {
          backgroundColor: token.colorBgContainer,
          borderColor: token.colorBorder,
          borderRadius: token.borderRadius,
          borderWidth: 1,
          marginVertical: fontSize * marginMultiple,
          overflow: 'hidden',
          unicodeBidi: 'isolate',
        },
        td: {
          color: token.colorText,
          minWidth: 120,
          padding: token.paddingSM,
        },
        th: {
          color: token.colorTextHeading,
          fontWeight: token.fontWeightStrong,
          minWidth: 120,
          padding: token.paddingSM,
        },
        thead: {
          backgroundColor: token.colorBgLayout,
        },
        tr: {
          borderBottomWidth: 1,
          borderColor: token.colorBorder,
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
        const scaledHeight = (h / w) * (width - token.padding * 2);
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

  const renderImage = (node: any) => {
    const { src } = node.attributes;
    return <RenderImage key={node.key} src={src} />;
  };

  // const renderVideo = (node: any) => {
  //   const { src, poster } = node.attributes;

  //   return (
  //     <Video
  //       key={node.key}
  //       style={[styles.image, { height: 200 }]}
  //       source={{ uri: src }}
  //       useNativeControls
  //       resizeMode={ResizeMode.CONTAIN}
  //       posterSource={{ uri: poster }}
  //       isLooping={false}
  //     />
  //   );
  // };

  const renderCodeBlock = (node: any) => {
    const { content, sourceInfo } = node;

    const language = sourceInfo.trim();

    return (
      <Highlighter
        allowChangeLanguage
        code={content}
        fullFeatured
        key={`${content}-${language}`}
        lang={language}
        style={{ marginVertical: 8 }}
        type="compact"
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Markdown
        // debugPrintTree
        markdownit={md}
        rules={{
          bullet_list: (node, children, _parent, styles) => (
            <View key={`bullet-list-${node.key}`} style={styles.bullet_list}>
              {children}
            </View>
          ),
          code_block: renderCodeBlock,
          fence: renderCodeBlock,
          image: renderImage,
          list_item: (node, children, _parent, styles) => (
            <View key={`list-item-${node.key}`} style={styles.list_item}>
              {children}
            </View>
          ),
          math_block: (node) => {
            return (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: token.colorBgContainer,
                  borderColor: token.colorBorder,
                  borderRadius: token.borderRadius,
                  borderWidth: 1,
                  marginVertical: fontSize * marginMultiple,
                  padding: token.paddingSM,
                }}
              >
                <MathJaxSvg
                  color={token.colorText}
                  fontCache={true}
                  fontSize={fontSize}
                  key={`math-block-${node.key}`}
                >
                  {`$$${node.content}$$`}
                </MathJaxSvg>
              </View>
            );
          },
          math_inline: (node) => (
            <MathJaxSvg
              color={token.colorText}
              fontCache={true}
              fontSize={fontSize}
              key={`math-inline-${node.key}`}
            >
              {`$$${node.content}$$`}
            </MathJaxSvg>
          ),
          ordered_list: (node, children, _, styles) => (
            <View key={`ordered-list-${node.key}`} style={styles.ordered_list}>
              {children}
            </View>
          ),
        }}
        style={styles}
      >
        {content}
      </Markdown>
    </View>
  );
};

export default MarkdownRender;
