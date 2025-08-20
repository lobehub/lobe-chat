import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import MarkdownRender from '../index';

const sampleMarkdown = `# 样式配置示例

这个示例展示了不同的样式配置如何影响Markdown的渲染效果。

## 标题层级

### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 文本内容

这是一个普通段落，用来展示基础文本的渲染效果。文本包含**粗体**、*斜体*和\`行内代码\`等格式。

这是另一个段落，用来测试段落间距和行高设置的效果。Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## 列表示例

- 列表项一
- 列表项二
  - 嵌套列表项
  - 另一个嵌套项
- 列表项三

## 代码块

\`\`\`javascript
function example() {
  console.log('代码块字体大小测试');
  return 'Hello World';
}
\`\`\`

## 引用块

> 这是一个引用块，用来测试引用样式的渲染效果。
> 支持多行引用内容。

---

通过调整样式参数，你可以看到不同的渲染效果。`;

export default function StylingDemo() {
  const [fontSize, setFontSize] = useState(16);
  const [headerMultiple, setHeaderMultiple] = useState(1);
  const [marginMultiple, setMarginMultiple] = useState(1.5);
  const [lineHeight, setLineHeight] = useState(1.8);

  const presets = [
    {
      fontSize: 16,
      headerMultiple: 1,
      lineHeight: 1.8,
      marginMultiple: 1.5,
      name: '默认',
    },
    {
      fontSize: 14,
      headerMultiple: 0.8,
      lineHeight: 1.5,
      marginMultiple: 1.2,
      name: '紧凑',
    },
    {
      fontSize: 18,
      headerMultiple: 1.2,
      lineHeight: 2,
      marginMultiple: 2,
      name: '宽松',
    },
    {
      fontSize: 16,
      headerMultiple: 1.5,
      lineHeight: 1.8,
      marginMultiple: 1.5,
      name: '大标题',
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setFontSize(preset.fontSize);
    setHeaderMultiple(preset.headerMultiple);
    setMarginMultiple(preset.marginMultiple);
    setLineHeight(preset.lineHeight);
  };

  const styles = StyleSheet.create({
    adjustButton: {
      alignItems: 'center',
      backgroundColor: '#2C2C2E',
      borderRadius: 16,
      height: 32,
      justifyContent: 'center',
      marginHorizontal: 8,
      width: 32,
    },
    adjustButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    adjustLabel: {
      color: '#FFFFFF',
      flex: 1,
      fontSize: 14,
    },
    adjustRow: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 12,
    },
    adjustValue: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
      minWidth: 40,
      textAlign: 'center',
    },
    configRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    configText: {
      color: '#A0A0A0',
      fontSize: 12,
    },
    container: {
      backgroundColor: '#000',
      flex: 1,
    },
    content: {
      padding: 16,
    },
    controlPanel: {
      backgroundColor: '#1C1C1E',
      borderRadius: 12,
      marginBottom: 16,
      padding: 16,
    },
    panelTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    presetButton: {
      backgroundColor: '#2C2C2E',
      borderRadius: 8,
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    presetButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      textAlign: 'center',
    },
    presetRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    separator: {
      backgroundColor: '#2C2C2E',
      height: 1,
      marginBottom: 16,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.content}>
        {/* 样式控制面板 */}
        <View style={styles.controlPanel}>
          <Text style={styles.panelTitle}>样式预设</Text>
          <View style={styles.presetRow}>
            {presets.map((preset) => (
              <Button
                key={preset.name}
                onPress={() => applyPreset(preset)}
                size="small"
                style={styles.presetButton}
                type="default"
              >
                {preset.name}
              </Button>
            ))}
          </View>

          <Text style={styles.panelTitle}>当前配置</Text>
          <View style={styles.configRow}>
            <Text style={styles.configText}>字体大小: {fontSize}px</Text>
            <Text style={styles.configText}>标题倍数: {headerMultiple}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configText}>边距倍数: {marginMultiple}</Text>
            <Text style={styles.configText}>行高: {lineHeight}</Text>
          </View>

          {/* 字体大小调节 */}
          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>字体大小:</Text>
            <Button
              onPress={() => setFontSize(Math.max(12, fontSize - 2))}
              size="small"
              style={styles.adjustButton}
              type="default"
            >
              -
            </Button>
            <Text style={styles.adjustValue}>{fontSize}</Text>
            <Button
              onPress={() => setFontSize(Math.min(24, fontSize + 2))}
              size="small"
              style={styles.adjustButton}
              type="default"
            >
              +
            </Button>
          </View>

          {/* 标题倍数调节 */}
          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>标题倍数:</Text>
            <Button
              onPress={() => setHeaderMultiple(Math.max(0.5, headerMultiple - 0.1))}
              size="small"
              style={styles.adjustButton}
              type="default"
            >
              -
            </Button>
            <Text style={styles.adjustValue}>{headerMultiple.toFixed(1)}</Text>
            <Button
              onPress={() => setHeaderMultiple(Math.min(2, headerMultiple + 0.1))}
              size="small"
              style={styles.adjustButton}
              type="default"
            >
              +
            </Button>
          </View>

          {/* 边距倍数调节 */}
          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>边距倍数:</Text>
            <Button
              onPress={() => setMarginMultiple(Math.max(0.5, marginMultiple - 0.1))}
              size="small"
              style={styles.adjustButton}
              type="default"
            >
              -
            </Button>
            <Text style={styles.adjustValue}>{marginMultiple.toFixed(1)}</Text>
            <Button
              onPress={() => setMarginMultiple(Math.min(3, marginMultiple + 0.1))}
              size="small"
              style={styles.adjustButton}
              type="default"
            >
              +
            </Button>
          </View>

          {/* 行高调节 */}
          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>行高:</Text>
            <Button
              onPress={() => setLineHeight(Math.max(1, lineHeight - 0.1))}
              size="small"
              style={styles.adjustButton}
              type="default"
            >
              -
            </Button>
            <Text style={styles.adjustValue}>{lineHeight.toFixed(1)}</Text>
            <Button
              onPress={() => setLineHeight(Math.min(3, lineHeight + 0.1))}
              size="small"
              style={styles.adjustButton}
              type="default"
            >
              +
            </Button>
          </View>
        </View>

        {/* 分隔线 */}
        <View style={styles.separator} />

        {/* Markdown 渲染区域 */}
        <MarkdownRender
          content={sampleMarkdown}
          fontSize={fontSize}
          headerMultiple={headerMultiple}
          lineHeight={lineHeight}
          marginMultiple={marginMultiple}
        />
      </View>
    </ScrollView>
  );
}
