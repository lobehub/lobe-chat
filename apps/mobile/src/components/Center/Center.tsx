import { memo } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import type { CenterProps } from './type';

const Center = memo<CenterProps>(
  ({
    horizontal,
    justify = 'center',
    align = 'center',
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
      width: width,
    };

    if (onPress) {
      return (
        <Pressable
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

Center.displayName = 'Center';

export default Center;
