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
  children,
  onPress,
  style,
  textStyle,
  ...rest
}) => {
  const { styles } = useStyles({ block, disabled: disabled || loading, size, type });

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      {...rest}
      activeOpacity={disabled || loading ? 1 : 0.7}
      disabled={disabled || loading}
      onPress={handlePress}
      style={[styles.button, style]}
    >
      {loading && (
        <ActivityIndicator color={styles.text.color} size="small" style={styles.loading} />
      )}
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;
