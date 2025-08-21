import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

import MarkdownRender from '../index';
import { code } from './data';

const AdvancedDemo = () => {
  const token = useThemeToken();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: token.colorBgLayout,
      flex: 1,
    },
    content: {
      backgroundColor: token.colorBgContainer,
      flex: 1,
      padding: 16,
    },
    title: {
      color: token.colorText,
      fontSize: 18,
      fontWeight: '600',
      padding: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>高级特性演示</Text>
      <View style={styles.content}>
        <MarkdownRender content={code} />
      </View>
    </View>
  );
};

export default AdvancedDemo;
