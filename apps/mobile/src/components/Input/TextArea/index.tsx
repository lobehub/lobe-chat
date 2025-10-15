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
    size,
    textStyle,
    numberOfLines,
    ...rest
  } = props;

  const { styles, theme } = useStyles({ size });

  return (
    <Block style={[styles.container, style]} variant={variant}>
      <RNTextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        multiline
        numberOfLines={numberOfLines}
        ref={ref}
        scrollEnabled={!!numberOfLines}
        {...rest}
        placeholderTextColor={placeholderTextColor ?? theme.colorTextPlaceholder}
        style={[styles.input, textStyle]}
        underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
      />
    </Block>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
