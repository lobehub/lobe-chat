import { memo } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import type { FlexboxProps } from './type';

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
    onLongPress,
    ...rest
  }) => {
    const styles: StyleProp<ViewStyle> = {
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
      position: 'relative',
      width: width,
    };

    if (onPress || onLongPress) {
      return (
        <Pressable
          onLongPress={onLongPress}
          onPress={onPress}
          style={(state) => [styles, typeof style === 'function' ? style(state) : style]}
          {...rest}
        >
          {children}
        </Pressable>
      );
    }

    return (
      <View
        style={[
          styles,
          typeof style === 'function' ? style({ hovered: false, pressed: false }) : style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  },
);

Flexbox.displayName = 'Flexbox';

export default Flexbox;
