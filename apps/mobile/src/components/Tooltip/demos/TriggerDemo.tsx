import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeToken } from '@/theme/ThemeProvider/context';
import Button from '@/components/Button';

import { Tooltip } from '..';

const styles = StyleSheet.create({
  demoContainer: {
    flex: 1,
    padding: 16,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoSection: {
    marginBottom: 16,
  },
});

const TriggerDemo = () => {
  const token = useThemeToken();

  return (
    <View style={[styles.demoContainer, { backgroundColor: token.colorBgLayout }]}>
      <View style={styles.demoSection}>
        <View style={styles.demoRow}>
          <Tooltip title="点击触发的提示" trigger="click">
            <Button type="primary">点击触发</Button>
          </Tooltip>

          <Tooltip title="长按触发的提示" trigger="longPress">
            <Button type="default">长按触发</Button>
          </Tooltip>
        </View>
      </View>
    </View>
  );
};

export default TriggerDemo;
