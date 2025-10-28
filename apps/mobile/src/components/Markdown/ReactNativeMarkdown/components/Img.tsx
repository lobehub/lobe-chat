import { Image, ImageLoadEventData } from 'expo-image';
import { memo, useState } from 'react';
import { Components } from 'react-markdown';
import { Pressable, useWindowDimensions } from 'react-native';

import { imageGallery } from '@/libs/imageGallery';

import { useStyles } from '../style';

const Img: Components['img'] = memo(({ src, alt }) => {
  const { styles, theme } = useStyles();
  const { width: windowWidth } = useWindowDimensions();
  const [imageSize, setImageSize] = useState<{ height: number; width: number } | null>(null);

  // 容器最大宽度（考虑内边距）
  const maxWidth = windowWidth - 32;

  const handleLoad = (event: ImageLoadEventData) => {
    const { width, height } = event.source;
    setImageSize({ height, width });
  };

  // 点击图片打开全屏画廊
  const handlePress = () => {
    if (src) {
      imageGallery.show([src], 0);
    }
  };

  // 计算显示尺寸
  const getImageStyle = () => {
    if (!imageSize) {
      // 加载前给一个占位高度
      return {
        height: 64,
        width: maxWidth,
      };
    }

    const { width, height } = imageSize;

    // 如果图片宽度大于容器宽度，设置为100%宽度，高度自适应
    if (width > maxWidth) {
      const aspectRatio = width / height;
      return {
        aspectRatio,
        borderRadius: theme.borderRadiusLG * 1.5,
        width: maxWidth,
      };
    }

    // 小图片使用原尺寸
    return {
      borderRadius: theme.borderRadius,
      height,
      width,
    };
  };

  return (
    <Pressable onPress={handlePress}>
      <Image
        alt={alt}
        cachePolicy="memory-disk"
        contentFit="contain"
        onLoad={handleLoad}
        source={{ uri: src }}
        style={[styles.img, getImageStyle()]}
        transition={150}
      />
    </Pressable>
  );
});

export default Img;
