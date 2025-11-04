import { Image as ExpoImage, type ImageLoadEventData } from 'expo-image';
import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';

import { imageGallery } from '@/libs/imageGallery';

import { useThemeMode } from '../ThemeProvider/context';
import { PreviewGroupContext } from './context';
import { FALLBACK_DARK, FALLBACK_LIGHT, useStyles } from './style';
import type { ImageProps } from './type';

/**
 * Image 组件
 * 基于 expo-image，增强了预览功能和自适应尺寸
 */
const Image = memo<ImageProps>(
  ({
    preview = true,
    previewSrc,
    source,
    fallback,
    autoSize = true,
    maxWidth,
    style,
    onLoad,
    width,
    height,
    onLongPress,
    onPress,
    ...rest
  }) => {
    const { styles, theme } = useStyles();
    const { isDarkMode } = useThemeMode();
    const { width: windowWidth } = useWindowDimensions();
    const groupContext = useContext(PreviewGroupContext);
    const [imageIndex, setImageIndex] = useState<number>(-1);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageSize, setImageSize] = useState<{ height: number; width: number } | null>(null);

    // 根据主题选择默认 fallback
    const defaultFallback = isDarkMode ? FALLBACK_DARK : FALLBACK_LIGHT;
    const finalFallback = fallback !== undefined ? fallback : defaultFallback;

    // 计算容器最大宽度
    const containerMaxWidth = maxWidth || windowWidth;

    // 提取图片 URL
    useEffect(() => {
      if (typeof source === 'string') {
        setImageUrl(source);
      } else if (source && typeof source === 'object' && 'uri' in source && source.uri) {
        setImageUrl(source.uri);
      }
    }, [source]);

    // 在 PreviewGroup 中注册图片
    useEffect(() => {
      if (groupContext.inGroup && imageUrl && groupContext.preview) {
        const index = groupContext.registerImage(imageUrl);
        setImageIndex(index);

        return () => {
          groupContext.unregisterImage(index);
        };
      }
    }, [groupContext, imageUrl]);

    // 处理图片加载完成
    const handleLoad = (event: ImageLoadEventData) => {
      const { width, height } = event.source;
      setImageSize({ height, width });

      // 调用用户提供的 onLoad 回调
      onLoad?.(event);
    };

    // 处理图片点击
    const handlePress = (e: any) => {
      onPress?.(e);
      if (!preview) return;

      // 如果在 PreviewGroup 中，使用 group 的预览功能
      if (groupContext.inGroup && groupContext.preview && imageIndex >= 0) {
        groupContext.showPreview(imageIndex);
        return;
      }

      // 单独预览
      const previewUrl = previewSrc || imageUrl;
      if (previewUrl) {
        imageGallery.show([previewUrl], 0);
      }
    };

    // 计算自适应样式
    const autoSizeStyle = useMemo(() => {
      if (!autoSize || !imageSize) return null;

      // 检查是否通过 props 或 style 指定了宽高
      const flatStyle = StyleSheet.flatten(style);
      const hasWidth = width !== undefined || flatStyle?.width !== undefined;
      const hasHeight = height !== undefined || flatStyle?.height !== undefined;

      // 如果同时指定了宽高，不自动调整
      if (hasWidth && hasHeight) return null;

      const { width: imgWidth, height: imgHeight } = imageSize;
      const finalWidth = width || flatStyle?.width;
      const finalHeight = height || flatStyle?.height;

      // 如果图片宽度大于容器宽度，使用 aspectRatio 自适应
      if (imgWidth > containerMaxWidth) {
        const aspectRatio = imgWidth / imgHeight;
        return {
          aspectRatio,
          borderRadius: theme.borderRadiusLG,
          width: finalWidth || containerMaxWidth,
        };
      }

      // 小图片使用原尺寸
      return {
        borderRadius: theme.borderRadius,
        height: finalHeight || imgHeight,
        width: finalWidth || imgWidth,
      };
    }, [autoSize, imageSize, style, width, height, containerMaxWidth, theme]);

    // 占位样式（图片加载前）
    const placeholderStyle = useMemo(() => {
      if (!autoSize || imageSize) return null;

      const flatStyle = StyleSheet.flatten(style);
      const hasHeight = height !== undefined || flatStyle?.height !== undefined;

      // 如果用户已经指定了高度，不使用占位高度
      if (hasHeight) return null;

      return {
        height: 200, // 占位高度
        width: width || flatStyle?.width || containerMaxWidth,
      };
    }, [autoSize, imageSize, style, width, height, containerMaxWidth]);

    // 合并所有样式
    const imageStyle = useMemo(() => {
      return [
        styles.image,
        style,
        autoSizeStyle || placeholderStyle,
        // width 和 height props 优先级最高
        width !== undefined && { width },
        height !== undefined && { height },
      ];
    }, [styles.image, style, autoSizeStyle, placeholderStyle, width, height]);

    const imageContent = (
      <ExpoImage
        {...rest}
        contentFit={rest.contentFit || 'contain'}
        onLoad={handleLoad}
        placeholder={finalFallback}
        source={source}
        style={imageStyle}
      />
    );

    const cantPreview = !preview || (groupContext.inGroup && !groupContext.preview);

    // 可点击预览的图片
    return (
      <Pressable
        onLongPress={onLongPress}
        onPress={!cantPreview ? handlePress : undefined}
        style={styles.container}
      >
        {imageContent}
      </Pressable>
    );
  },
);

Image.displayName = 'Image';

export default Image;
