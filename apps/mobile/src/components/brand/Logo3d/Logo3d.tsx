import React, { memo } from 'react';
import type { ImageStyle, StyleProp } from 'react-native';
import { Image } from 'react-native';

export interface Logo3dProps {
  /**
   * 图片描述
   * @default 'LobeHub'
   */
  alt?: string;
  /**
   * 图片尺寸（宽度和高度相同）
   * @default 32
   */
  size?: number;
  /**
   * 自定义样式
   */
  style?: StyleProp<ImageStyle>;
}

const Logo3d = memo<Logo3dProps>(({ size = 32, style, alt = 'LobeHub' }) => {
  return (
    <Image
      accessibilityLabel={alt}
      resizeMode="contain"
      source={require('../../../../assets/images/logo.png')}
      style={[{ height: size, width: size }, style]}
    />
  );
});

Logo3d.displayName = 'Logo3d';

export default Logo3d;
