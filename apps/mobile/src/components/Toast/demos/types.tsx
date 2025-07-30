import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme/context';

import { useToast } from '../ToastProvider';
import { DemoButton } from './DemoButton';

const styles = StyleSheet.create({
  buttonGroup: {
    gap: 8,
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tips: {
    borderRadius: 8,
    borderWidth: 1,
    margin: 16,
    padding: 16,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default function TypesDemo() {
  const toast = useToast();
  const token = useThemeToken();

  const showSuccess = () => {
    toast.success('成功：操作已完成');
  };

  const showError = () => {
    toast.error('错误：请检查您的输入');
  };

  const showInfo = () => {
    toast.info('信息：系统将在5分钟后维护');
  };

  const showLoading = () => {
    toast.loading('正在处理中...', 3000);
    setTimeout(() => {
      toast.success('处理完成！');
    }, 3000);
  };

  const showMultiple = () => {
    toast.success('第一条消息');
    setTimeout(() => toast.info('第二条消息'), 500);
    setTimeout(() => toast.error('第三条消息'), 1000);
  };

  const showPersistent = () => {
    toast.info('这条消息不会自动消失', 0);
  };

  return (
    <View style={[styles.container, { backgroundColor: token.colorBgLayout }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>消息类型</Text>
        <View style={styles.buttonGroup}>
          <DemoButton
            description="显示成功状态"
            onPress={showSuccess}
            title="成功消息"
            variant="success"
          />
          <DemoButton
            description="显示错误状态"
            onPress={showError}
            title="错误消息"
            variant="error"
          />
          <DemoButton
            description="显示一般信息"
            onPress={showInfo}
            title="信息消息"
            variant="primary"
          />
          <DemoButton
            description="显示加载状态，3秒后自动完成"
            onPress={showLoading}
            title="加载消息"
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>特殊场景</Text>
        <View style={styles.buttonGroup}>
          <DemoButton
            description="快速显示多条消息"
            onPress={showMultiple}
            title="连续消息"
            variant="primary"
          />
          <DemoButton
            description="不会自动消失，需要手动关闭"
            onPress={showPersistent}
            title="持久消息"
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.tips}>
        <Text style={[styles.tipsTitle, { color: token.colorTextSecondary }]}>提示</Text>
        <Text style={[styles.tipsText, { color: token.colorTextTertiary }]}>
          • 点击消息可以立即关闭{'\n'}• 同时最多显示3条消息{'\n'}• 新消息会推送旧消息向上移动
        </Text>
      </View>
    </View>
  );
}
