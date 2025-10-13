import { Button, Tooltip, useTheme } from '@lobehub/ui-rn';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const BasicDemo = () => {
  const token = useTheme();

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
        <Tooltip title="这是一个长按提示" trigger="longPress">
          <Button>长按我</Button>
        </Tooltip>
      </View>
    </View>
  );
};

export default BasicDemo;
