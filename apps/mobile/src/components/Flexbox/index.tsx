import React, { ReactNode, memo } from 'react';
import {
  DimensionValue,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewProps,
} from 'react-native';

export type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export interface FlexboxProps extends ViewProps {
  align?: AlignItems;
  children?: ReactNode;
  flex?: number | undefined;
  gap?: number | string | undefined;
  height?: DimensionValue | undefined;
  horizontal?: boolean;
  justify?: JustifyContent;
  onPress?: PressableProps['onPress'];
  padding?: DimensionValue | undefined;
  paddingBlock?: DimensionValue | undefined;
  paddingInline?: DimensionValue | undefined;
  width?: DimensionValue | undefined;
  wrap?: FlexWrap;
}

const Flexbox = memo<FlexboxProps>(
  ({
    horizontal,
    justify = 'flex-start',
    align = 'stretch',
    wrap = 'nowrap',
    flex,
    children,
    width,
    height,
    gap,
    style,
    padding,
    paddingBlock,
    paddingInline,
    onPress,
    ...rest
  }) => {
    const styles: StyleProp<any> = [
      {
        alignItems: align,
        display: 'flex',
        flex: flex,
        flexDirection: horizontal ? 'row' : 'column',
        flexWrap: wrap,
        gap: gap,
        height: height,
        justifyContent: justify,
        padding: padding,
        paddingBlock: paddingBlock,
        paddingInline: paddingInline,
        width: width,
      },
      style,
    ];

    if (onPress) {
      return (
        <Pressable onPress={onPress} style={styles} {...rest}>
          {children}
        </Pressable>
      );
    }
    return (
      <View style={styles} {...rest}>
        {children}
      </View>
    );
  },
);

Flexbox.displayName = 'Flexbox';

export default Flexbox;
