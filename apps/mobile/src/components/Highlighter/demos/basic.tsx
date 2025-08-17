import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme/ThemeProvider/context';

import Highlighter from '../index';

/**
 * 基础代码高亮演示
 * 展示最简单的使用方式
 */
export const BasicHighlighterDemo: React.FC = () => {
  const token = useThemeToken();

  const codeExamples = [
    {
      code: `function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}\`;
}

const user = 'React Native';
greet(user);`,
      lang: 'javascript',
      title: 'JavaScript 基础语法',
    },
    {
      code: `interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

const createUser = (data: Partial<User>): User => {
  return {
    id: Date.now(),
    isActive: true,
    ...data
  } as User;
};`,
      lang: 'typescript',
      title: 'TypeScript 接口定义',
    },
    {
      code: `.container {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: linear-gradient(
    135deg, 
    #667eea 0%, 
    #764ba2 100%
  );
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12px;
}`,
      lang: 'css',
      title: 'CSS 样式规则',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      padding: token.padding,
    },
    description: {
      color: token.colorTextSecondary,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight * token.fontSize,
      marginBottom: token.marginXXL,
    },
    exampleContainer: {
      marginBottom: token.marginXXL,
    },
    exampleTitle: {
      color: token.colorText,
      fontSize: token.fontSizeLG,
      fontWeight: '600',
      marginBottom: token.marginSM,
    },
    infoContainer: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius,
      borderWidth: token.lineWidth,
      marginTop: token.marginLG,
      padding: token.padding,
    },
    infoText: {
      color: token.colorTextSecondary,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM * token.fontSizeSM,
    },
    infoTitle: {
      color: token.colorText,
      fontSize: token.fontSize,
      fontWeight: '600',
      marginBottom: token.marginXS,
    },
    title: {
      color: token.colorTextHeading,
      fontSize: token.fontSizeHeading2,
      fontWeight: 'bold',
      marginBottom: token.marginXS,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: token.colorBgLayout }]}>
      <Text style={[styles.title, { color: token.colorText }]}>基础代码高亮</Text>
      <Text style={[styles.description, { color: token.colorTextSecondary }]}>
        展示不同编程语言的基础语法高亮效果，无额外功能。
      </Text>

      {codeExamples.map((example, index) => (
        <View key={index} style={styles.exampleContainer}>
          <Text style={[styles.exampleTitle, { color: token.colorTextSecondary }]}>
            {example.title}
          </Text>
          <Highlighter code={example.code} lang={example.lang} />
        </View>
      ))}

      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, { color: token.colorTextSecondary }]}>使用说明：</Text>
        <Text style={[styles.infoText, { color: token.colorTextSecondary }]}>
          • 基础模式只提供语法高亮功能{'\n'}• 渲染性能最优，适合简单展示{'\n'}• 无交互功能，无工具栏
          {'\n'}• 适用于文档、教程等场景
        </Text>
      </View>
    </View>
  );
};

export default BasicHighlighterDemo;
