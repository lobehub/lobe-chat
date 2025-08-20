import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { useThemeToken } from '@/theme';

import { useToast } from '../ToastProvider';

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
          <Button
            onPress={showSuccess}
            style={{ backgroundColor: token.colorSuccess }}
            type="primary"
          >
            成功提示
          </Button>
          <Button onPress={showError} style={{ backgroundColor: token.colorError }} type="primary">
            错误提示
          </Button>
          <Button
            onPress={showWarning}
            style={{ backgroundColor: token.colorWarning }}
            type="primary"
          >
            警告提示
          </Button>
          <Button onPress={showInfo} type="primary">
            信息提示
          </Button>
          <Button onPress={showLoading} type="default">
            加载提示
          </Button>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>内容测试</Text>
        <View style={styles.buttonGroup}>
          <Button onPress={showLongContent} type="primary">
            长内容测试
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
