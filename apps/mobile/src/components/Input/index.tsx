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

export interface InputProps extends Omit<RNTextInputProps, 'multiline' | 'style'> {
  contentStyle?: StyleProp<TextStyle>;
  prefix?: React.ReactNode;
  size?: 'large' | 'middle' | 'small';
  style?: StyleProp<ViewStyle>;
  suffix?: React.ReactNode;
  variant?: 'filled' | 'borderless' | 'outlined';
}

const Input = React.forwardRef<RNTextInput, InputProps>((props, ref) => {
  const {
    style,
    contentStyle,
    placeholderTextColor,
    underlineColorAndroid,
    prefix,
    suffix,
    variant = 'filled',
    size = 'middle',
    ...rest
  } = props;
  const multiline = false;
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

export interface TextAreaProps extends Omit<RNTextInputProps, 'multiline' | 'style'> {
  contentStyle?: StyleProp<TextStyle>;
  prefix?: React.ReactNode;
  size?: 'large' | 'middle' | 'small';
  style?: StyleProp<ViewStyle>;
  suffix?: React.ReactNode;
  variant?: 'filled' | 'borderless' | 'outlined';
}

const TextArea = React.forwardRef<RNTextInput, TextAreaProps>((props, ref) => {
  const {
    style,
    contentStyle,
    placeholderTextColor,
    underlineColorAndroid,
    prefix,
    suffix,
    variant = 'filled',
    size = 'middle',
    ...rest
  } = props;
  const multiline = true;
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

const InputSearch = React.forwardRef<RNTextInput, InputProps>((props, ref) => {
  const token = useThemeToken();
  const size = props.size ?? 'middle';
  const iconSize = size === 'large' ? token.fontSizeLG : token.fontSize;

  return (
    <Input
      ref={ref}
      {...props}
      prefix={<Search color={token.colorTextPlaceholder} size={iconSize} />}
      returnKeyType="search"
    />
  );
});

const InputPassword = React.forwardRef<RNTextInput, Omit<InputProps, 'suffix' | 'secureTextEntry'>>(
  (props, ref) => {
    const token = useThemeToken();
    const [isSecure, setIsSecure] = React.useState(true);
    const size = props.size ?? 'middle';
    const iconSize = size === 'large' ? token.fontSizeLG : token.fontSize;

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
              <EyeOff color={token.colorTextPlaceholder} size={iconSize} />
            ) : (
              <Eye color={token.colorTextPlaceholder} size={iconSize} />
            )}
          </TouchableOpacity>
        }
      />
    );
  },
);

// Add compound components to main Input component
const InputWithCompounds = Input as typeof Input & {
  Password: typeof InputPassword;
  Search: typeof InputSearch;
  TextArea: typeof TextArea;
};

InputWithCompounds.Search = InputSearch;
InputWithCompounds.Password = InputPassword;
InputWithCompounds.TextArea = TextArea;

export default InputWithCompounds;
