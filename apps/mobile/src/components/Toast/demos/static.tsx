import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { useThemeToken } from '@/theme';

import Toast from '../index';

const showSuccess = () => {
  Toast.success('操作成功');
};

const showError = () => {
  Toast.error('操作失败，请检查您的网络连接并重试');
};

const showInfo = () => {
  Toast.info('您有新的系统更新可用');
};

const showLoading = () => {
  Toast.loading({ duration: 3000, message: '加载中...' });
};

export default function StaticDemo() {
  const token = useThemeToken();

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
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>静态方法调用</Text>
        <View style={styles.buttonGroup}>
          <Button
            onPress={showSuccess}
            style={{ backgroundColor: token.colorSuccess }}
            type="primary"
          >
            Toast.success()
          </Button>
          <Button onPress={showError} style={{ backgroundColor: token.colorError }} type="primary">
            Toast.error()
          </Button>
          <Button onPress={showInfo} type="primary">
            Toast.info()
          </Button>
          <Button onPress={showLoading} type="default">
            Toast.loading()
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
