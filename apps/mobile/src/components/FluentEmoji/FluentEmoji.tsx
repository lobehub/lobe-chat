import { Image } from 'expo-image';
import { memo, useMemo, useState } from 'react';
import { Text } from 'react-native';

import Center from '@/components/Center';

import type { FluentEmojiProps } from './type';
import { genCdnUrl, genEmojiUrl } from './utils';

/**
 * FluentEmoji 组件 - 用于渲染微软 Fluent 风格的 3D 表情符号
 */
const FluentEmoji = memo<FluentEmojiProps>(({ emoji, size = 32, type = '3d', ...rest }) => {
  const [imageError, setImageError] = useState(false);
  const emojiUrl = useMemo(() => genEmojiUrl(emoji, type), [type, emoji]);

  let content;

  if (type === 'pure' || !emojiUrl || imageError) {
    content = <Text style={{ fontSize: size * 0.9 }}>{emoji}</Text>;
  } else {
    const emojiCdnUrl = genCdnUrl(emojiUrl);
    content = (
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

  return (
    <Center height={size} width={size} {...rest}>
      {content}
    </Center>
  );
});

FluentEmoji.displayName = 'FluentEmoji';

export default FluentEmoji;
