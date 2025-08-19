import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

import Highlighter from '../index';

/**
 * 完整功能模式演示
 * 展示所有可用的高级功能
 */
export const FullFeaturedHighlighterDemo: React.FC = () => {
  const token = useThemeToken();

  const examples = [
    {
      code: `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
}

const Counter: React.FC<CounterProps> = ({ 
  initialValue = 0, 
  onValueChange 
}) => {
  const [count, setCount] = useState(initialValue);

  useEffect(() => {
    onValueChange?.(count);
  }, [count, onValueChange]);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  return (
    <View style={styles.container}>
      <Text style={styles.countText}>{count}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={decrement}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={reset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={increment}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Counter;`,
      description: '包含工具栏、复制功能、展开收起',
      fileName: 'Counter.tsx',
      lang: 'typescript',
      title: '标准完整功能',
    },
    {
      code: `# React Native 项目配置

## 环境要求
- Node.js >= 16
- React Native CLI
- Xcode (iOS开发)
- Android Studio (Android开发)

## 安装依赖
\`\`\`bash
npm install
# 或
yarn install
\`\`\`

## 运行项目
\`\`\`bash
# iOS
npx react-native run-ios

# Android  
npx react-native run-android
\`\`\`

## 项目结构
\`\`\`
src/
├── components/     # 公共组件
├── screens/       # 页面组件
├── utils/         # 工具函数
├── types/         # 类型定义
└── constants/     # 常量配置
\`\`\``,
      description: '显示文件名而不是语言标识',
      fileName: 'README.md',
      lang: 'markdown',
      title: '带文件名显示',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      padding: token.padding,
    },
    description: {
      color: token.colorTextSecondary,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      marginBottom: token.marginXXL,
    },
    exampleContainer: {
      marginBottom: token.marginXXL,
    },
    exampleDescription: {
      color: token.colorTextTertiary,
      fontSize: token.fontSizeSM,
      fontStyle: 'italic',
      marginBottom: token.marginSM,
    },
    exampleTitle: {
      color: token.colorText,
      fontSize: token.fontSizeLG,
      fontWeight: '600',
      marginBottom: token.marginXXS,
    },
    featuresContainer: {
      backgroundColor: token.colorInfoBg,
      borderLeftColor: token.colorInfo,
      borderLeftWidth: 4,
      borderRadius: token.borderRadius,
      marginTop: token.marginLG,
      padding: token.padding,
    },
    featuresText: {
      color: token.colorInfoText,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
    },
    featuresTitle: {
      color: token.colorInfo,
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
    <View style={styles.container}>
      <Text style={styles.title}>完整功能模式</Text>
      <Text style={styles.description}>
        展示包含工具栏、复制、展开收起等完整功能的代码高亮组件。
      </Text>

      {examples.map((example, index) => (
        <View key={index} style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>{example.title}</Text>
          <Text style={styles.exampleDescription}>{example.description}</Text>
          <Highlighter
            code={example.code}
            copyable
            fileName={example.fileName}
            fullFeatured
            lang={example.lang}
            showLanguage
          />
        </View>
      ))}

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>功能特性：</Text>
        <Text style={styles.featuresText}>
          • 🔧 工具栏：包含展开/收起、复制按钮{'\n'}• 📄 文件名：可显示文件名或语言标识{'\n'}• 📋
          复制功能：一键复制代码到剪贴板{'\n'}• 📱 展开收起：节省屏幕空间，按需显示{'\n'}• 🎨
          完整主题：基于系统主题的高亮效果
        </Text>
      </View>
    </View>
  );
};

export default FullFeaturedHighlighterDemo;
