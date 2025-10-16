import { forwardRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';

import Block from '../../Block';
import { TextAreaProps } from '../type';
import { useStyles } from './style';

const TextArea = forwardRef<RNTextInput, TextAreaProps>((props, ref) => {
  const {
    style,
    placeholderTextColor,
    underlineColorAndroid,
    variant = 'filled',
    disabled,
    size,
    textStyle,
    numberOfLines,
    ...rest
  } = props;

  const { styles, theme } = useStyles({ size });

  return (
    <Block
      disabled={disabled}
      style={[styles.container, disabled && { opacity: 0.6 }, style]}
      variant={disabled ? 'filled' : variant}
    >
      <RNTextInput
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
        keyboardType="default"
        multiline
        numberOfLines={numberOfLines}
        ref={ref}
        scrollEnabled={!!numberOfLines}
        {...rest}
        placeholderTextColor={placeholderTextColor ?? theme.colorTextPlaceholder}
        style={[styles.input, disabled && { opacity: 0.6 }, textStyle]}
        underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
      />
    </Block>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
