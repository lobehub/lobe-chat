import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  NativeSyntheticEvent,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  TextInputContentSizeChangeEventData,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { InputVariant } from '../type';
import { useStyles } from './style';

export interface TextAreaProps extends Omit<RNTextInputProps, 'multiline' | 'style'> {
  autoSize?: boolean | { maxRows?: number; minRows?: number };
  style?: StyleProp<ViewStyle>;
  variant?: InputVariant;
}

const TextArea = forwardRef<RNTextInput, TextAreaProps>((props, ref) => {
  const {
    autoSize = false,
    style,
    placeholderTextColor,
    underlineColorAndroid,
    variant = 'filled',
    onContentSizeChange,
    scrollEnabled,
    ...rest
  } = props;

  const { styles, theme } = useStyles({ variant });
  const rowHeight = useMemo(() => {
    return Math.max(1, Math.max(theme.fontHeight, theme.fontSize));
  }, [theme.fontHeight, theme.fontSize]);

  const autoSizeEnabled = autoSize === true || typeof autoSize === 'object';
  const autoSizeConfig = autoSizeEnabled && typeof autoSize === 'object' ? autoSize : undefined;
  const minRows = autoSizeEnabled ? Math.max(1, autoSizeConfig?.minRows ?? 1) : undefined;
  const maxRows =
    autoSizeEnabled && autoSizeConfig && typeof autoSizeConfig.maxRows === 'number'
      ? Math.max(autoSizeConfig.maxRows, minRows ?? 1)
      : undefined;

  const minHeight = autoSizeEnabled && minRows ? rowHeight * minRows : undefined;
  const maxHeight = autoSizeEnabled && maxRows ? rowHeight * maxRows : undefined;

  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);

  const clampAutoSizeHeight = useCallback(
    (height: number) => {
      if (!autoSizeEnabled || minHeight === undefined) {
        return height;
      }
      const bounded = Math.max(height, minHeight);
      if (maxHeight === undefined) return bounded;
      return Math.min(bounded, maxHeight);
    },
    [autoSizeEnabled, minHeight, maxHeight],
  );

  useEffect(() => {
    if (!autoSizeEnabled) {
      setInputHeight(undefined);
      return;
    }

    setInputHeight((prev) => {
      if (prev === undefined) return prev;
      const next = clampAutoSizeHeight(prev);
      return next === prev ? prev : next;
    });
  }, [autoSizeEnabled, clampAutoSizeHeight]);

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      if (autoSizeEnabled) {
        const nextHeight = clampAutoSizeHeight(event.nativeEvent.contentSize.height);
        setInputHeight((prev) => (prev === nextHeight ? prev : nextHeight));
      }
      onContentSizeChange?.(event);
    },
    [autoSizeEnabled, clampAutoSizeHeight, onContentSizeChange],
  );

  const resolvedScrollEnabled = scrollEnabled ?? !autoSizeEnabled;

  const autoSizeStyle = useMemo(() => {
    if (!autoSizeEnabled || minHeight === undefined) {
      return undefined;
    }
    const height = inputHeight !== undefined ? clampAutoSizeHeight(inputHeight) : minHeight;
    const styleValue: TextStyle = {
      height,
      minHeight,
    };
    if (maxHeight !== undefined) {
      styleValue.maxHeight = maxHeight;
    }
    return styleValue;
  }, [autoSizeEnabled, clampAutoSizeHeight, inputHeight, maxHeight, minHeight]);

  return (
    <View style={[styles.container, style]}>
      <RNTextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        multiline
        ref={ref}
        {...rest}
        onContentSizeChange={handleContentSizeChange}
        placeholderTextColor={placeholderTextColor ?? theme.colorTextPlaceholder}
        scrollEnabled={resolvedScrollEnabled}
        style={[styles.input, autoSizeStyle]}
        underlineColorAndroid={underlineColorAndroid ?? 'transparent'}
      />
    </View>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
