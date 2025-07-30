import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useThemeToken } from '@/theme/context';

import { Tooltip } from '..';

const BasicDemo = () => {
  const token = useThemeToken();

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: token.colorPrimary,
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    buttonText: {
      color: token.colorText,
      fontSize: 14,
      fontWeight: '500',
    },
    demoContainer: {
      backgroundColor: token.colorBgLayout,
      flex: 1,
      padding: 16,
    },
    demoSection: {
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.demoContainer}>
      <View style={styles.demoSection}>
        <Tooltip title="这是一个长按提示">
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>长按我</Text>
          </TouchableOpacity>
        </Tooltip>
      </View>
    </View>
  );
};

export default BasicDemo;
