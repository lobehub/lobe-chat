import React, { useState } from 'react';
import { View, Text } from 'react-native';

import InstantSwitch from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginLG,
    padding: token.paddingLG,
  },
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    marginBottom: token.marginSM,
  },
  label: {
    color: token.colorText,
    fontSize: token.fontSize,
  },
  section: {
    gap: token.marginSM,
  },
  switchRow: {
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600' as const,
    marginBottom: token.marginXS,
  },
}));

const SizesDemo = () => {
  const { styles } = useStyles();
  const [smallEnabled, setSmallEnabled] = useState(false);
  const [defaultEnabled, setDefaultEnabled] = useState(true);
  const [largeEnabled, setLargeEnabled] = useState(false);

  // 模拟异步操作
  const handleSmallChange = async (enabled: boolean) => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });
    setSmallEnabled(enabled);
  };

  const handleDefaultChange = async (enabled: boolean) => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
    setDefaultEnabled(enabled);
  };

  const handleLargeChange = async (enabled: boolean) => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1200);
    });
    setLargeEnabled(enabled);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>不同尺寸</Text>
        <Text style={styles.description}>InstantSwitch支持三种尺寸：small、default、large</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Small尺寸</Text>
          <InstantSwitch enabled={smallEnabled} onChange={handleSmallChange} size="small" />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Default尺寸</Text>
          <InstantSwitch enabled={defaultEnabled} onChange={handleDefaultChange} size="default" />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Large尺寸</Text>
          <InstantSwitch enabled={largeEnabled} onChange={handleLargeChange} size="large" />
        </View>
      </View>
    </View>
  );
};

export default SizesDemo;
