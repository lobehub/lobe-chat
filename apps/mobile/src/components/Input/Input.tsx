import { debounce } from 'lodash-es';
import { Eye, EyeOff, Search } from 'lucide-react-native';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import { useTheme, useThemeMode } from '@/components/styles';

import Block from '../Block';
import TextArea from './TextArea';
import { useStyles } from './style';
import type { InputProps, InputSearchProps } from './type';

const Input = forwardRef<RNTextInput, InputProps>((props, ref) => {
  const {
    style,
    placeholderTextColor,
    underlineColorAndroid,
    prefix,
    suffix,
    variant,
    size = 'middle',
    textStyle,
    disabled,
    glass,
    block,
    ...rest
  } = props;
  const { styles, theme } = useStyles({ size });
  const { isDarkMode } = useThemeMode();
  return (
    <Block
      align={'center'}
      disabled={disabled}
      glass={glass}
      horizontal
      pressableStyle={{
        flex: 1,
      }}
      style={[styles.container, block && styles.block, disabled && { opacity: 0.6 }, style]}
      variant={disabled ? 'filled' : variant ? variant : isDarkMode ? 'filled' : 'outlined'}
    >
      {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
      <RNTextInput
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
        keyboardType="default"
        placeholderTextColor={placeholderTextColor ?? theme.colorTextPlaceholder}
        ref={ref}
        style={[styles.input, disabled && { opacity: 0.6 }, textStyle]}
        underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
        {...rest}
      />
      {suffix && <View style={styles.suffixContainer}>{suffix}</View>}
    </Block>
  );
});

export const InputSearch = forwardRef<RNTextInput, InputSearchProps>((props, ref) => {
  const { debounceWait = 300, onChangeText, onSearch, ...restProps } = props;
  const theme = useTheme();
  const size = props.size ?? 'middle';
  const iconSize = size === 'large' ? theme.fontSizeLG : theme.fontSize;

  // 使用 ref 保存防抖函数，确保可以在组件卸载时取消
  const debouncedOnSearchRef = useRef<ReturnType<typeof debounce> | undefined>(undefined);

  // 创建防抖的 onSearch 回调
  const debouncedOnSearch = useMemo(() => {
    if (!onSearch) return undefined;

    const debouncedFn = debounce((text: string) => {
      onSearch(text);
    }, debounceWait);

    debouncedOnSearchRef.current = debouncedFn;

    return debouncedFn;
  }, [onSearch, debounceWait]);

  // 组件卸载时取消防抖
  useEffect(() => {
    return () => {
      debouncedOnSearchRef.current?.cancel();
    };
  }, []);

  // 处理文本变化：立即调用 onChangeText，防抖调用 onSearch
  const handleChangeText = useCallback(
    (text: string) => {
      // 立即更新输入框，不防抖
      onChangeText?.(text);
      // 防抖调用搜索回调
      debouncedOnSearch?.(text);
    },
    [onChangeText, debouncedOnSearch],
  );

  return (
    <Input
      ref={ref}
      {...restProps}
      onChangeText={handleChangeText}
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
