import React from 'react';

import ComponentPlayground, { DemoItem } from '../Playground';
import { BasicDemo, PrefixDemo } from '@/components/TextInput/demos';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from './style';
import { Header } from '@/components';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <PrefixDemo />, key: 'prefix', title: '带前缀' },
];

const readmeContent = `# TextInput组件

一个增强的React Native文本输入组件，支持前缀图标和自定义样式。

## 特性

- ✅ **前缀支持** - 支持添加前缀图标或文本
- ✅ **统一样式** - 基于设计系统的一致性样式
- ✅ **灵活布局** - 使用View包装实现灵活布局
- ✅ **TypeScript** - 完整的TypeScript类型支持
- ✅ **主题适配** - 自动适配明暗主题
- ✅ **平台优化** - 针对Android和iOS的样式优化

## 基本用法

### 1. 基础输入框

\`\`\`jsx
import TextInput from '@/components/TextInput';

<TextInput placeholder="请输入内容" />
<TextInput defaultValue="预设值" />
\`\`\`

### 2. 带前缀的输入框

\`\`\`jsx
import { Text } from 'react-native';

<TextInput 
  placeholder="请输入用户名" 
  prefix={<Text>@</Text>}
/>

<TextInput 
  placeholder="请输入密码" 
  prefix={<Text>🔒</Text>}
  secureTextEntry
/>
\`\`\`

### 3. 自定义样式

\`\`\`jsx
<TextInput
  placeholder="自定义样式"
  style={{ backgroundColor: 'red' }}
  contentStyle={{ fontSize: 18 }}
/>
\`\`\`

## API参考

### TextInputProps

| 属性 | 类型 | 描述 |
|------|------|------|
| \`prefix\` | \`React.ReactNode\` | 前缀内容 |
| \`style\` | \`StyleProp<ViewStyle>\` | 外层容器样式 |
| \`contentStyle\` | \`StyleProp<TextStyle>\` | 输入框样式 |
| ...其他 | \`RNTextInputProps\` | React Native TextInput 的所有属性 |

## 设计原则

- **一致性**：统一的外观和交互体验
- **灵活性**：支持各种自定义需求
- **易用性**：简单直观的API设计`;

export default function TextInputPlayground() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="TextInput 组件" />
      <ComponentPlayground
        demos={demos}
        readmeContent={readmeContent}
        subtitle="增强的文本输入组件"
        title="TextInput 组件"
      />
    </SafeAreaView>
  );
}
