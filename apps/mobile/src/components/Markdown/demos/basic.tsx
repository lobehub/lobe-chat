import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme/context';

import MarkdownRender from '../index';

const basicMarkdown = `# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold** and *italic* text.

- Item 1
- Item 2
  - Nested item
- Item 3

1. First item
2. Second item
3. Third item

> This is a blockquote
> with multiple lines

[Link to GitHub](https://github.com)

![React Logo](https://reactjs.org/logo-og.png)
`;

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
        <MarkdownRender content={basicMarkdown} />
      </View>
    </View>
  );
};

export default BasicDemo;
