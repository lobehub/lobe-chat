import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useThemeToken } from '@/components/ThemeProvider/context';

interface DemoButtonProps {
  description?: string;
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const DemoButton: React.FC<DemoButtonProps> = ({
  title,
  onPress,
  description,
  variant = 'primary',
}) => {
  const token = useThemeToken();

  const getVariantStyle = () => {
    switch (variant) {
      case 'success': {
        return { backgroundColor: token.colorSuccess };
      }
      case 'warning': {
        return { backgroundColor: token.colorWarning };
      }
      case 'error': {
        return { backgroundColor: token.colorError };
      }
      case 'secondary': {
        return {
          backgroundColor: token.colorFillSecondary,
          borderColor: token.colorBorder,
          borderWidth: 1,
        };
      }
      default: {
        return { backgroundColor: token.colorPrimary };
      }
    }
  };

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      borderRadius: 8,
      justifyContent: 'center',
      marginBottom: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      ...getVariantStyle(),
    },
    buttonText: {
      color: token.colorText,
      fontSize: 16,
      fontWeight: '600',
    },
    description: {
      color: token.colorTextSecondary,
      fontSize: 12,
      marginTop: 4,
    },
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </TouchableOpacity>
  );
};
