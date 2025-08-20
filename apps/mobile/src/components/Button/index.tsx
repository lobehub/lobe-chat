import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { useStyles, ButtonType, ButtonSize } from './style';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  block?: boolean;
  children?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  size?: ButtonSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  type?: ButtonType;
}

const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'middle',
  loading = false,
  disabled = false,
  block = false,
  danger = false,
  children,
  onPress,
  style,
  textStyle,
  ...rest
}) => {
  const { styles } = useStyles({ block, danger, disabled: disabled || loading, size, type });

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      {...rest}
      accessibilityRole="button"
      activeOpacity={disabled || loading ? 1 : 0.7}
      disabled={disabled || loading}
      onPress={handlePress}
      style={[styles.button, style]}
      testID="button"
    >
      {loading && (
        <ActivityIndicator
          color={styles.text.color}
          size="small"
          style={styles.loading}
          testID="loading-indicator"
        />
      )}
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;
