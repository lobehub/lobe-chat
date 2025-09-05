import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useStyles } from './style';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  contentStyle?: StyleProp<TextStyle>;
  prefix?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const TextInput = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  const { styles, token } = useStyles();
  const { style, contentStyle, placeholderTextColor, underlineColorAndroid, prefix, ...rest } =
    props;

  return (
    <View style={[styles.container, style]}>
      {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
      <RNTextInput
        ref={ref}
        {...rest}
        placeholderTextColor={placeholderTextColor ?? token.colorTextPlaceholder}
        style={[styles.input, contentStyle]}
        underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
      />
    </View>
  );
});

export default TextInput;
