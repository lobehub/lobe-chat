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

const BasicDemo = () => {
  const { styles } = useStyles();
  const [basicEnabled, setBasicEnabled] = useState(false);
  const [customEnabled, setCustomEnabled] = useState(true);

  // 模拟异步操作
  const handleBasicChange = async (enabled: boolean) => {
    // 模拟网络请求延迟
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
    setBasicEnabled(enabled);
  };

  const handleCustomChange = async (enabled: boolean) => {
    // 模拟网络请求延迟
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });
    setCustomEnabled(enabled);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>基础用法</Text>
        <Text style={styles.description}>基础的InstantSwitch用法，支持异步切换操作</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>基础开关</Text>
          <InstantSwitch enabled={basicEnabled} onChange={handleBasicChange} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>自定义颜色</Text>
        <Text style={styles.description}>自定义轨道和滑块颜色</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>自定义颜色</Text>
          <InstantSwitch
            enabled={customEnabled}
            loadingColor="#339af0"
            onChange={handleCustomChange}
            thumbColor="#ffffff"
            trackColor={{
              false: '#ff6b6b',
              true: '#51cf66',
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default BasicDemo;
