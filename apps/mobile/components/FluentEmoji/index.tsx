import React, { memo, useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import { useStyles } from './style';
import { genEmojiUrl, EmojiType, genCdnUrl } from './utils';

export interface FluentEmojiProps {
  /**
   * 要显示的表情符号
   */
  emoji: string;

  /**
   * 表情符号尺寸
   * @default 32
   */
  size?: number;

  /**
   * @description The type of the FluentUI emoji set to be used
   * @default '3d'
   */
  type?: EmojiType;
}

/**
 * FluentEmoji 组件 - 用于渲染微软 Fluent 风格的 3D 表情符号
 */
const FluentEmoji = memo<FluentEmojiProps>(({ emoji, size = 32, type = '3d' }) => {
  const [imageError, setImageError] = useState(false);
  const { styles } = useStyles(size);

  const emojiUrl = useMemo(() => genEmojiUrl(emoji, type), [type, emoji]);

  if (type === 'pure' || !emojiUrl || imageError)
    return (
      <View
        style={[
          styles.container,
          { alignItems: 'center', height: size, justifyContent: 'center', width: size },
        ]}
      >
        <Text style={{ fontSize: size * 0.9 }}>{emoji}</Text>
      </View>
    );

  const emojiCdnUrl = genCdnUrl(emojiUrl);
  const isSvg = emojiCdnUrl.endsWith('.svg');
  const isAnimated = type === 'anim';

  const renderEmoji = () => {
    if (isAnimated) {
      // Use WebView for animated WebP to support animation
      // WARN:has performance issue, be careful to use
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
              * { margin: 0; padding: 0; }
              body { 
                margin: 0; 
                padding: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                background: transparent; 
                overflow: hidden;
              }
              img { 
                width: ${size}px; 
                height: ${size}px; 
                object-fit: contain; 
                display: block;
              }
            </style>
          </head>
          <body>
            <img src="${emojiCdnUrl}" alt="${emoji}" onerror="window.ReactNativeWebView.postMessage('IMAGE_ERROR');" />
          </body>
        </html>
      `;

      return (
        <WebView
          allowsInlineMediaPlayback={true}
          automaticallyAdjustContentInsets={false}
          bounces={false}
          domStorageEnabled={false}
          javaScriptEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          onError={() => setImageError(true)}
          onHttpError={() => setImageError(true)}
          onMessage={(event) => {
            if (event.nativeEvent.data === 'IMAGE_ERROR') {
              setImageError(true);
            }
          }}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          source={{ html }}
          style={{ backgroundColor: 'transparent', height: size, width: size }}
        />
      );
    } else if (isSvg) {
      return (
        <SvgUri
          accessibilityLabel={emoji}
          height={size}
          onError={() => setImageError(true)}
          uri={emojiCdnUrl}
          width={size}
        />
      );
    } else {
      return (
        <Image
          accessibilityLabel={emoji}
          height={size}
          onError={() => setImageError(true)}
          source={{ uri: emojiCdnUrl }}
          width={size}
        />
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        { alignItems: 'center', height: size, justifyContent: 'center', width: size },
      ]}
    >
      {renderEmoji()}
    </View>
  );
});

export default FluentEmoji;
