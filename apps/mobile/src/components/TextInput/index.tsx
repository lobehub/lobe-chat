import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
} from 'react-native';

import { useStyles } from './style';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  style?: StyleProp<TextStyle>;
}

const TextInput = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  const { styles, token } = useStyles();
  const { style, placeholderTextColor, underlineColorAndroid, ...rest } = props;

  return (
    <RNTextInput
      ref={ref}
      {...rest}
      placeholderTextColor={placeholderTextColor ?? token.colorTextPlaceholder}
      style={[styles.input, style]}
      underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
    />
  );
});

export default TextInput;
