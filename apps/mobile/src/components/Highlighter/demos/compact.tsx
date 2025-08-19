import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

import Highlighter from '../index';

/**
 * 紧凑型显示演示
 * 展示适合内联和小空间的紧凑型代码高亮
 */
export const CompactHighlighterDemo: React.FC = () => {
  const token = useThemeToken();

  const examples = [
    {
      description: '适合展示终端命令和脚本',
      items: [
        { code: 'npm install react-native', lang: 'bash' },
        { code: 'yarn add @types/react-native', lang: 'bash' },
        { code: 'npx react-native init MyApp', lang: 'bash' },
        { code: 'cd MyApp && npm start', lang: 'bash' },
      ],
      title: '命令行指令',
    },
    {
      description: '短小的代码示例',
      items: [
        { code: 'const [state, setState] = useState(0);', lang: 'javascript' },
        { code: 'interface Props { title: string; }', lang: 'typescript' },
        { code: 'export default function App() {}', lang: 'typescript' },
        { code: 'import React from "react";', lang: 'javascript' },
      ],
      title: '代码片段',
    },
    {
      description: '配置文件的关键片段',
      items: [
        { code: '"scripts": { "start": "expo start" }', lang: 'json' },
        { code: 'expo: { name: "MyApp", slug: "my-app" }', lang: 'yaml' },
        { code: 'FROM node:18-alpine', lang: 'dockerfile' },
        { code: 'git clone https://github.com/user/repo.git', lang: 'bash' },
      ],
      title: '配置片段',
    },
  ];

  const styles = StyleSheet.create({
    comparisonContainer: {
      backgroundColor: token.colorWarningBg,
      borderLeftColor: token.colorWarning,
      borderLeftWidth: 4,
      borderRadius: token.borderRadius,
      marginBottom: token.marginXXL,
      padding: token.padding,
    },
    comparisonItem: {
      marginBottom: token.marginLG,
    },
    comparisonLabel: {
      color: token.colorWarningText,
      fontSize: token.fontSizeSM,
      fontWeight: '500',
      marginBottom: token.marginXS,
    },
    comparisonTitle: {
      color: token.colorWarning,
      fontSize: token.fontSizeLG,
      fontWeight: '600',
      marginBottom: token.marginLG,
    },
    container: {
      padding: token.padding,
    },
    description: {
      color: token.colorTextSecondary,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      marginBottom: token.marginXXL,
    },
    itemContainer: {
      marginBottom: token.marginXS,
    },
    itemsContainer: {
      gap: token.marginXS,
    },
    sectionContainer: {
      marginBottom: token.marginXXL,
    },
    sectionDescription: {
      color: token.colorTextTertiary,
      fontSize: token.fontSizeSM,
      fontStyle: 'italic',
      marginBottom: token.marginLG,
    },
    sectionTitle: {
      color: token.colorText,
      fontSize: token.fontSizeHeading4,
      fontWeight: '600',
      marginBottom: token.marginXXS,
    },
    title: {
      color: token.colorTextHeading,
      fontSize: token.fontSizeHeading2,
      fontWeight: 'bold',
      marginBottom: token.marginXS,
    },
    usageContainer: {
      backgroundColor: token.colorSuccessBg,
      borderLeftColor: token.colorSuccess,
      borderLeftWidth: 4,
      borderRadius: token.borderRadius,
      padding: token.padding,
    },
    usageText: {
      color: token.colorSuccessText,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
    },
    usageTitle: {
      color: token.colorSuccess,
      fontSize: token.fontSize,
      fontWeight: '600',
      marginBottom: token.marginXS,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>紧凑型显示</Text>
      <Text style={styles.description}>
        紧凑型模式适合显示短小的代码片段、命令行指令和配置片段。
      </Text>

      {examples.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionDescription}>{section.description}</Text>

          <View style={styles.itemsContainer}>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.itemContainer}>
                <Highlighter
                  code={item.code}
                  copyable
                  fullFeatured
                  lang={item.lang}
                  showLanguage={false}
                  type="compact"
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonTitle}>模式对比</Text>

        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>默认模式：</Text>
          <Highlighter
            code="console.log('Hello World');"
            fileName="example.js"
            fullFeatured
            lang="javascript"
            type="default"
          />
        </View>

        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>紧凑模式：</Text>
          <Highlighter
            code="console.log('Hello World');"
            copyable
            fullFeatured
            lang="javascript"
            showLanguage={false}
            type="compact"
          />
        </View>
      </View>

      <View style={styles.usageContainer}>
        <Text style={styles.usageTitle}>适用场景：</Text>
        <Text style={styles.usageText}>
          • 📱 移动端内联代码展示{'\n'}• 🔧 终端命令行指令{'\n'}• ⚙️ 配置文件片段{'\n'}• 📝
          教程中的短代码示例{'\n'}• 💬 聊天界面中的代码分享{'\n'}• 📊 表格中的代码单元格
        </Text>
      </View>
    </View>
  );
};

export default CompactHighlighterDemo;
