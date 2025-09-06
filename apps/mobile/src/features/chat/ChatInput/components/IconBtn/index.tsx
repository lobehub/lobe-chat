import React, { memo } from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

import { getButtonSize, useStyles } from './styles';

interface IconBtnProps extends TouchableOpacityProps {
  containerStyle?: ViewStyle;
  icon: React.ReactNode;
  size?: number;
  variant?: 'default' | 'primary';
}

const IconBtn = memo<IconBtnProps>(
  ({ icon, variant = 'default', size = 24, containerStyle, style, ...props }) => {
    const { styles } = useStyles();

    const getButtonStyle = (): ViewStyle => {
      const baseStyle = {
        ...styles.buttonBase,
        ...getButtonSize(size),
      };

      if (variant === 'primary') {
        return {
          ...baseStyle,
          ...styles.buttonPrimary,
        };
      }

      return baseStyle;
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[getButtonStyle(), containerStyle, style]}
        {...props}
      >
        {icon}
      </TouchableOpacity>
    );
  },
);

IconBtn.displayName = 'IconBtn';

export default IconBtn;
