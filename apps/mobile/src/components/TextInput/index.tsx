import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Search, Eye, EyeOff } from 'lucide-react-native';

import { useStyles } from './style';
import { useThemeToken } from '@/theme';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  contentStyle?: StyleProp<TextStyle>;
  prefix?: React.ReactNode;
  size?: 'large' | 'middle' | 'small';
  style?: StyleProp<ViewStyle>;
  suffix?: React.ReactNode;
  variant?: 'filled' | 'borderless' | 'outlined';
}

const TextInput = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  const {
    style,
    contentStyle,
    placeholderTextColor,
    underlineColorAndroid,
    prefix,
    suffix,
    multiline = false,
    variant = 'filled',
    size = 'middle',
    ...rest
  } = props;
  const { styles, token } = useStyles({ multiline, size, variant });

  return (
    <View style={[styles.container, style]}>
      {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
      <RNTextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        multiline={multiline}
        ref={ref}
        {...rest}
        placeholderTextColor={placeholderTextColor ?? token.colorTextPlaceholder}
        style={[styles.input, contentStyle]}
        underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
      />
      {suffix && <View style={styles.suffixContainer}>{suffix}</View>}
    </View>
  );
});

const TextInputSearch = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  const token = useThemeToken();
  const size = props.size ?? 'middle';
  const iconSize =
    size === 'small' ? token.fontSizeSM : size === 'large' ? token.fontSizeLG : token.fontSize;

  return (
    <TextInput
      ref={ref}
      {...props}
      prefix={<Search color={token.colorTextPlaceholder} size={iconSize} />}
      returnKeyType="search"
    />
  );
});

const TextInputPassword = React.forwardRef<
  RNTextInput,
  Omit<TextInputProps, 'suffix' | 'secureTextEntry'>
>((props, ref) => {
  const token = useThemeToken();
  const [isSecure, setIsSecure] = React.useState(true);
  const size = props.size ?? 'middle';
  const iconSize =
    size === 'small' ? token.fontSizeSM : size === 'large' ? token.fontSizeLG : token.fontSize;

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <TextInput
      ref={ref}
      {...props}
      secureTextEntry={isSecure}
      suffix={
        <TouchableOpacity onPress={toggleSecureEntry} style={{ padding: 2 }}>
          {isSecure ? (
            <EyeOff color={token.colorTextPlaceholder} size={iconSize} />
          ) : (
            <Eye color={token.colorTextPlaceholder} size={iconSize} />
          )}
        </TouchableOpacity>
      }
    />
  );
});

// Add compound components to main TextInput component
const TextInputWithCompounds = TextInput as typeof TextInput & {
  Password: typeof TextInputPassword;
  Search: typeof TextInputSearch;
};

TextInputWithCompounds.Search = TextInputSearch;
TextInputWithCompounds.Password = TextInputPassword;

export default TextInputWithCompounds;
