import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export interface CenterProps {
  /**
   * 是否填充可用空间
   * @default false
   */
  block?: boolean;
  /**
   * 子元素
   */
  children?: ReactNode;
  /**
   * 是否在水平方向居中
   * @default true
   */
  horizontal?: boolean;
  /**
   * 容器的最小高度
   */
  minHeight?: number | string;
  /**
   * 容器的最小宽度
   */
  minWidth?: number | string;
  /**
   * 自定义样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   * 测试 ID
   */
  testID?: string;
  /**
   * 是否在垂直方向居中
   * @default true
   */
  vertical?: boolean;
}

const Center: React.FC<CenterProps> = ({
  horizontal = true,
  vertical = true,
  block = false,
  minHeight,
  minWidth,
  children,
  style,
  testID,
}) => {
  const centerStyle: ViewStyle = {
    display: 'flex',
    ...(horizontal && { justifyContent: 'center' }),
    ...(vertical && { alignItems: 'center' }),
    ...(block && { flex: 1, width: '100%' }),
    ...(minHeight !== undefined && { minHeight }),
    ...(minWidth !== undefined && { minWidth }),
  };

  return (
    <View style={[centerStyle, style]} testID={testID}>
      {children}
    </View>
  );
};

export default Center;
