import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

import { useToast } from '../ToastProvider';
import { DemoButton } from './DemoButton';

export default function BasicDemo() {
  const token = useThemeToken();
  const toast = useToast();

  const showSuccess = () => {
    toast.success('操作成功');
  };

  const showError = () => {
    toast.error('操作失败，请检查您的网络连接并重试');
  };

  const showWarning = () => {
    toast.info('注意：此操作将会覆盖现有数据');
  };

  const showInfo = () => {
    toast.info('您有新的系统更新可用');
  };

  const showLoading = () => {
    toast.loading('加载中...', 3000);
  };

  const showLongContent = () => {
    toast.success(
      '这是一个非常长的标题用于测试文本截断功能，当文本内容超出显示区域时，应该能够正确地进行截断或者换行显示。',
    );
  };

  const styles = StyleSheet.create({
    buttonGroup: {
      gap: 8,
    },
    container: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: token.colorBgLayout }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>基础类型</Text>
        <View style={styles.buttonGroup}>
          <DemoButton
            description="显示成功类型的 Toast"
            onPress={showSuccess}
            title="成功提示"
            variant="success"
          />
          <DemoButton
            description="显示错误类型的 Toast"
            onPress={showError}
            title="错误提示"
            variant="error"
          />
          <DemoButton
            description="显示警告类型的 Toast"
            onPress={showWarning}
            title="警告提示"
            variant="warning"
          />
          <DemoButton
            description="显示信息类型的 Toast"
            onPress={showInfo}
            title="信息提示"
            variant="primary"
          />
          <DemoButton
            description="显示加载状态的 Toast"
            onPress={showLoading}
            title="加载提示"
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>内容测试</Text>
        <View style={styles.buttonGroup}>
          <DemoButton
            description="测试长文本的显示效果"
            onPress={showLongContent}
            title="长内容测试"
            variant="primary"
          />
        </View>
      </View>
    </ScrollView>
  );
}
