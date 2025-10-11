import { Eye, EyeOff, Search } from 'lucide-react-native';
import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

import TextArea from './TextArea';
import { useStyles } from './style';
import { InputSize, InputVariant } from './type';

export type { TextAreaProps } from './TextArea';

export interface InputProps extends Omit<RNTextInputProps, 'multiline' | 'style'> {
  prefix?: React.ReactNode;
  size?: InputSize;
  style?: StyleProp<ViewStyle>;
  suffix?: React.ReactNode;
  variant?: InputVariant;
}

const Input = React.forwardRef<RNTextInput, InputProps>((props, ref) => {
  const {
    style,
    placeholderTextColor,
    underlineColorAndroid,
    prefix,
    suffix,
    variant = 'outlined',
    size = 'middle',
    ...rest
  } = props;
  const { styles, theme } = useStyles({ size, variant });

  return (
    <View style={[styles.container, style]}>
      {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
      <RNTextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        ref={ref}
        {...rest}
        placeholderTextColor={placeholderTextColor ?? theme.colorTextPlaceholder}
        style={[styles.input]}
        underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
      />
      {suffix && <View style={styles.suffixContainer}>{suffix}</View>}
    </View>
  );
});

const InputSearch = React.forwardRef<RNTextInput, InputProps>((props, ref) => {
  const theme = useTheme();
  const size = props.size ?? 'middle';
  const iconSize = size === 'large' ? theme.fontSizeLG : theme.fontSize;

  return (
    <Input
      ref={ref}
      {...props}
      prefix={<Search color={theme.colorTextPlaceholder} size={iconSize} />}
      returnKeyType="search"
    />
  );
});

const InputPassword = React.forwardRef<RNTextInput, Omit<InputProps, 'suffix' | 'secureTextEntry'>>(
  (props, ref) => {
    const theme = useTheme();
    const [isSecure, setIsSecure] = React.useState(true);
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
              <EyeOff color={theme.colorTextPlaceholder} size={iconSize} />
            ) : (
              <Eye color={theme.colorTextPlaceholder} size={iconSize} />
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
