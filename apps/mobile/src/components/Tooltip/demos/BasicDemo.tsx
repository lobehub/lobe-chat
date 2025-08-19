import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeToken } from '@/theme';
import Button from '@/components/Button';

import { Tooltip } from '..';

const BasicDemo = () => {
  const token = useThemeToken();

  const styles = StyleSheet.create({
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
          <Button type="primary">长按我</Button>
        </Tooltip>
      </View>
    </View>
  );
};

export default BasicDemo;
