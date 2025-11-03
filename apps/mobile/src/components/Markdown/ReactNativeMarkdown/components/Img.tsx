import { memo } from 'react';
import { Components } from 'react-markdown';
import { useWindowDimensions } from 'react-native';

import Image from '@/components/Image';

import { useStyles } from '../style';

/**
 * Markdown 图片组件
 * 使用 Image 组件实现，支持自适应尺寸和预览功能
 */
const Img: Components['img'] = memo(({ src, alt }) => {
  const { styles, theme } = useStyles();
  const { width: windowWidth } = useWindowDimensions();

  // 容器最大宽度（考虑内边距）
  const maxWidth = windowWidth - 32;

  if (!src) return null;

  return (
    <Image
      accessibilityLabel={alt}
      autoSize
      borderRadius={theme.borderRadius}
      cachePolicy="memory-disk"
      contentFit="contain"
      enableLiveTextInteraction
      maxWidth={maxWidth}
      preview
      source={{ uri: src }}
      style={styles.img}
      transition={150}
      variant="borderless"
    />
  );
});

Img.displayName = 'MarkdownImg';

export default Img;
