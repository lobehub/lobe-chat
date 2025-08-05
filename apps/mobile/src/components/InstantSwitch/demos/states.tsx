import React, { useState } from 'react';
import { View, Text } from 'react-native';

import InstantSwitch from '../index';
import { createStyles } from '@/theme';

const handleErrorChange = async () => {
  // 模拟网络错误
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
  throw new Error('Network error');
};

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

const StatesDemo = () => {
  const { styles } = useStyles();
  const [loadingEnabled, setLoadingEnabled] = useState(false);
  const [disabledEnabled] = useState(true);
  const [errorEnabled] = useState(false);

  // 模拟异步操作
  const handleLoadingChange = async (enabled: boolean) => {
    // 模拟较长的网络请求延迟
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
    setLoadingEnabled(enabled);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Loading状态</Text>
        <Text style={styles.description}>切换时会显示loading指示器，模拟异步操作</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Loading状态</Text>
          <InstantSwitch enabled={loadingEnabled} onChange={handleLoadingChange} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>禁用状态</Text>
        <Text style={styles.description}>禁用状态下无法进行切换操作</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>禁用状态</Text>
          <InstantSwitch disabled={true} enabled={disabledEnabled} onChange={async () => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>错误处理</Text>
        <Text style={styles.description}>模拟网络错误，切换失败时会回滚状态</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>错误处理</Text>
          <InstantSwitch enabled={errorEnabled} onChange={handleErrorChange} />
        </View>
      </View>
    </View>
  );
};

export default StatesDemo;
