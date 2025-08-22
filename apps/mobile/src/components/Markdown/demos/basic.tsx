import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

import MarkdownRender from '../index';
import { content } from './data';

const BasicDemo = () => {
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
      <Text style={styles.title}>基础 Markdown 渲染</Text>
      <View style={styles.content}>
        <MarkdownRender content={content} />
      </View>
    </View>
  );
};

export default BasicDemo;
