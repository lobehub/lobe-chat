import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

import MarkdownRender from '../index';

const stylingContent = `# 样式配置演示

## 不同字体大小

这是正常大小的文本内容，包含**粗体**和*斜体*文本。

## 代码样式

内联代码：\`console.log('Hello World')\`

代码块：
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to the app, \${name}\`;
}

const message = greet('Developer');
console.log(message);
\`\`\`

## 引用块样式

> 这是一个引用块的示例
> 
> 它可以包含多行内容，展示引用的样式效果
> 
> **引用内也可以包含格式化文本**

## 表格样式

| 属性名 | 类型 | 默认值 | 描述 |
|-------|-----|-------|------|
| \`fontSize\` | \`number\` | \`16\` | 基础字体大小 |
| \`headerMultiple\` | \`number\` | \`1\` | 标题字体倍数 |
| \`lineHeight\` | \`number\` | \`1.8\` | 行高倍数 |

## 链接样式

访问 [GitHub](https://github.com) 查看更多信息。

## 分割线样式

---

这是分割线后的内容。`;

const StylingDemo = () => {
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
      <Text style={styles.title}>样式配置示例</Text>
      <View style={styles.content}>
        <MarkdownRender
          content={stylingContent}
          fontSize={14}
          headerMultiple={1.2}
          lineHeight={1.6}
          marginMultiple={1.2}
        />
      </View>
    </View>
  );
};

export default StylingDemo;
