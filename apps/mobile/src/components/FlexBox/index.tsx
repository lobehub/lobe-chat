import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export interface FlexBoxProps {
  /**
   * 交叉轴上的对齐方式
   * @default 'stretch'
   */
  align?: AlignItems;
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
   * 主轴的方向
   * @default 'column'
   */
  direction?: FlexDirection;
  /**
   * flex 属性
   */
  flex?: number;
  /**
   * 主轴上的对齐方式
   * @default 'flex-start'
   */
  justify?: JustifyContent;
  /**
   * 自定义样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   * 测试 ID
   */
  testID?: string;
  /**
   * 是否换行
   * @default 'nowrap'
   */
  wrap?: FlexWrap;
}

const FlexBox: React.FC<FlexBoxProps> = ({
  direction = 'column',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  flex,
  block = false,
  children,
  style,
  testID,
}) => {
  const flexBoxStyle: ViewStyle = {
    alignItems: align,
    display: 'flex',
    flexDirection: direction,
    flexWrap: wrap,
    justifyContent: justify,
    ...(flex !== undefined && { flex }),
    ...(block && { width: '100%' }),
  };

  return (
    <View style={[flexBoxStyle, style]} testID={testID}>
      {children}
    </View>
  );
};

export default FlexBox;
