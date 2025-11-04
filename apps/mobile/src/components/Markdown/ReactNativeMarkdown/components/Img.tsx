import { memo, useContext } from 'react';
import { Components } from 'react-markdown';

import Image from '@/components/Image';

import { useStyles } from '../style';
import { BlockContext } from './context';

/**
 * Markdown 图片组件
 * 使用 Image 组件实现，支持自适应尺寸和预览功能
 */
const Img: Components['img'] = memo(({ src, alt }) => {
  const { styles } = useStyles();
  const { type } = useContext(BlockContext);

  if (!src) return null;

  const autoSize = type !== 'list';

  return (
    <Image
      accessibilityLabel={alt}
      cachePolicy="memory-disk"
      contentFit="contain"
      enableLiveTextInteraction
      preview
      source={{ uri: src }}
      style={[styles.img]}
      transition={150}
      width={autoSize ? undefined : '100%'}
    />
  );
});

Img.displayName = 'MarkdownImg';

export default Img;
