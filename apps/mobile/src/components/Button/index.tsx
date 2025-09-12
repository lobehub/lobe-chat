import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';

import { useStyles, ButtonType, ButtonSize, ButtonShape } from './style';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  block?: boolean;
  children?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  onPress?: () => void;
  shape?: ButtonShape;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  type?: ButtonType;
}

const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'middle',
  shape = 'default',
  loading = false,
  disabled = false,
  block = false,
  danger = false,
  children,
  onPress,
  style,
  textStyle,
  icon,
  ...rest
}) => {
  const { styles } = useStyles({ block, danger, disabled: disabled || loading, shape, size, type });

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const renderIcon = () => {
    if (loading || !icon) return null;
    const iconColor = (styles.text?.color as string) ?? undefined;
    // Always match icon size to button text size for consistency
    const iconSize = (styles.text?.fontSize as number) ?? undefined;

    let iconNode = icon;
    if (React.isValidElement(icon)) {
      const prevStyle = (icon.props as any)?.style;
      iconNode = React.cloneElement(icon as React.ReactElement<any>, {
        color: iconColor,
        size: iconSize,
        style: [prevStyle, { color: iconColor, fontSize: iconSize }],
      });
    }

    return (
      <View style={styles.loading} testID="button-icon">
        {iconNode}
      </View>
    );
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
      {renderIcon()}
      {children ? <Text style={[styles.text, textStyle]}>{children}</Text> : undefined}
    </TouchableOpacity>
  );
};

export default Button;
