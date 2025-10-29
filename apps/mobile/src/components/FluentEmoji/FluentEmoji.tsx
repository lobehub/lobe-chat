import { Image } from 'expo-image';
import { memo, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { useStyles } from './style';
import type { FluentEmojiProps } from './type';
import { genCdnUrl, genEmojiUrl } from './utils';

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

  const renderEmoji = () => {
    if (isSvg) {
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
          autoplay
          cachePolicy="memory-disk"
          contentFit="cover"
          onError={() => setImageError(true)}
          source={{ uri: emojiCdnUrl }}
          style={{ height: size, width: size }}
          transition={150}
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

FluentEmoji.displayName = 'FluentEmoji';

export default FluentEmoji;
