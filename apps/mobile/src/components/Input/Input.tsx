import { Eye, EyeOff, Search } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/components/styles';

import Block from '../Block';
import TextArea from './TextArea';
import { useStyles } from './style';
import type { InputProps } from './type';

const Input = forwardRef<RNTextInput, InputProps>((props, ref) => {
  const {
    style,
    placeholderTextColor,
    underlineColorAndroid,
    prefix,
    suffix,
    variant = 'outlined',
    size = 'middle',
    textStyle,
    disabled,
    ...rest
  } = props;
  const { styles, theme } = useStyles({ size });

  return (
    <Block
      align={'center'}
      disabled={disabled}
      horizontal
      style={[styles.container, disabled && { opacity: 0.6 }, style]}
      variant={disabled ? 'filled' : variant}
    >
      {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
      <RNTextInput
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
        keyboardType="default"
        ref={ref}
        {...rest}
        placeholderTextColor={placeholderTextColor ?? theme.colorTextPlaceholder}
        style={[styles.input, disabled && { opacity: 0.6 }, textStyle]}
        underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
      />
      {suffix && <View style={styles.suffixContainer}>{suffix}</View>}
    </Block>
  );
});

export const InputSearch = forwardRef<RNTextInput, InputProps>((props, ref) => {
  const theme = useTheme();
  const size = props.size ?? 'middle';
  const iconSize = size === 'large' ? theme.fontSizeLG : theme.fontSize;

  return (
    <Input
      ref={ref}
      {...props}
      prefix={<Search color={theme.colorTextDescription} size={iconSize * 1.25} />}
      returnKeyType="search"
    />
  );
});

export const InputPassword = forwardRef<
  RNTextInput,
  Omit<InputProps, 'suffix' | 'secureTextEntry'>
>((props, ref) => {
  const theme = useTheme();
  const [isSecure, setIsSecure] = useState(true);
  const size = props.size ?? 'middle';
  const iconSize = size === 'large' ? theme.fontSizeLG : theme.fontSize;

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <Input
      ref={ref}
      {...props}
      secureTextEntry={isSecure}
      suffix={
        <TouchableOpacity onPress={toggleSecureEntry} style={{ padding: 2 }}>
          {isSecure ? (
            <EyeOff color={theme.colorTextDescription} size={iconSize * 1.25} />
          ) : (
            <Eye color={theme.colorTextDescription} size={iconSize * 1.25} />
          )}
        </TouchableOpacity>
      }
    />
  );
});

// Add compound components to main Input component
const InputWithCompounds = Input as typeof Input & {
  Password: typeof InputPassword;
  Search: typeof InputSearch;
  TextArea: typeof TextArea;
};

InputWithCompounds.Search = InputSearch;
InputWithCompounds.Password = InputPassword;
InputWithCompounds.TextArea = TextArea;

InputWithCompounds.displayName = 'Input';

export default InputWithCompounds;
