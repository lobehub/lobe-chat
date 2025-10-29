import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { memo, useCallback, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Gallery } from 'react-native-zoom-toolkit';

import { FullWindowOverlay } from '../FullWindowOverlay';
import { useStyles } from './style';
import type { ImageGalleryProps } from './type';

const ImageGalleryItem = memo<{ uri: string }>(({ uri }) => {
  const { styles } = useStyles();
  const { width, height } = useWindowDimensions();
  const [imageSize, setImageSize] = useState<{ height: number; width: number } | null>(null);

  // 计算图片显示尺寸
  const getImageStyle = () => {
    if (!imageSize) {
      return {
        height: height * 0.8,
        opacity: 0,
        width: width,
      };
    }

    const { width: imgWidth, height: imgHeight } = imageSize;
    const aspectRatio = imgWidth / imgHeight;
    const containerAspectRatio = width / height;

    if (aspectRatio > containerAspectRatio) {
      // 图片更宽，以宽度为准
      return {
        height: width / aspectRatio,
        width: width,
      };
    } else {
      // 图片更高，以高度为准
      return {
        height: height,
        width: height * aspectRatio,
      };
    }
  };

  return (
    <View style={styles.imageContainer}>
      {imageSize ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <Image
            autoplay
            cachePolicy="memory-disk"
            contentFit="contain"
            enableLiveTextInteraction
            source={{ uri }}
            style={getImageStyle()}
          />
        </Animated.View>
      ) : (
        <Image
          autoplay
          cachePolicy="memory-disk"
          contentFit="contain"
          enableLiveTextInteraction
          onLoad={(e) => {
            setImageSize({
              height: e.source.height,
              width: e.source.width,
            });
          }}
          source={{ uri }}
          style={getImageStyle()}
        />
      )}
    </View>
  );
});

ImageGalleryItem.displayName = 'ImageGalleryItem';

const ImageGallery = memo<ImageGalleryProps>(({ images, initialIndex = 0, onClose }) => {
  const { styles } = useStyles();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const renderItem = useCallback((uri: string) => {
    return <ImageGalleryItem uri={uri} />;
  }, []);

  const keyExtractor = useCallback((uri: string, index: number) => {
    return `${uri}-${index}`;
  }, []);

  // 点击时关闭
  const handleTap = useCallback(() => {
    onClose();
  }, [onClose]);

  // 索引变化时更新
  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <FullWindowOverlay>
      <View style={styles.container}>
        {/* iOS 毛玻璃背景 */}
        {Platform.OS === 'ios' && <BlurView style={StyleSheet.absoluteFillObject} tint="dark" />}

        <Gallery
          data={images}
          initialIndex={initialIndex}
          keyExtractor={keyExtractor}
          onIndexChange={handleIndexChange}
          onTap={handleTap}
          renderItem={renderItem}
        />

        {/* 图片指示器 */}
        {images.length > 1 && (
          <View style={styles.indicator}>
            <Animated.Text entering={FadeIn} style={styles.indicatorText}>
              {currentIndex + 1} / {images.length}
            </Animated.Text>
          </View>
        )}
      </View>
    </FullWindowOverlay>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
