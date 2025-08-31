import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeToken } from '@/theme';

import { Markdown } from '@/components';
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
      <View style={styles.content}>
        <Markdown>{content}</Markdown>
      </View>
    </View>
  );
};

export default BasicDemo;
