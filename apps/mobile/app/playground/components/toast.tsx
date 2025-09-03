import React from 'react';

import ComponentPlayground, { DemoItem } from '../Playground';
import {
  AdvancedDemo,
  BasicDemo,
  IntegrationDemo,
  StaticDemo,
  TypesDemo,
} from '@/components/Toast/demos';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from './style';
import { Header } from '@/components';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TypesDemo />, key: 'types', title: '类型演示' },
  { component: <StaticDemo />, key: 'static', title: '静态方法' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
  { component: <IntegrationDemo />, key: 'integration', title: '集成示例' },
];

const readmeContent = `# Toast组件

一个优雅的React Native Toast通知组件，支持多种类型的消息提示和动画效果。

## 特性

- ✅ **多种类型** - 支持success、error、info、loading四种类型
- ✅ **优雅动画** - 流畅的滑入滑出动画效果
- ✅ **自动消失** - 可配置的自动隐藏时间
- ✅ **手动关闭** - 支持点击关闭和手动控制
- ✅ **安全区域** - 自动适配安全区域，避免遮挡状态栏
- ✅ **多实例管理** - 支持同时显示多个Toast
- ✅ **暗色主题** - 现代化的暗色设计风格
- ✅ **TypeScript** - 完整的TypeScript类型支持
- ✅ **Context API** - 基于React Context的状态管理
- ✅ **便捷API** - 简洁易用的调用接口

## 基本用法

### 1. 设置ToastProvider

\`\`\`jsx
import { ToastProvider } from '@/components/Toast/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      {/* 你的应用内容 */}
      <YourAppContent />
    </ToastProvider>
  );
}
\`\`\`

### 2. 使用useToast Hook

\`\`\`jsx
import { useToast } from '@/components/Toast/ToastProvider';

export default function MyComponent() {
  const toast = useToast();

  const showSuccess = () => {
    toast.success('操作成功！');
  };

  const showError = () => {
    toast.error('操作失败，请重试');
  };

  return (
    <View>
      <Button title="成功提示" onPress={showSuccess} />
      <Button title="错误提示" onPress={showError} />
    </View>
  );
}
\`\`\`

## API参考

### useToast Hook

| 方法 | 类型 | 描述 |
|------|------|------|
| \`show\` | \`(config: ToastConfig) => void\` | 显示自定义配置的Toast |
| \`success\` | \`(message: string, duration?: number) => void\` | 显示成功Toast |
| \`error\` | \`(message: string, duration?: number) => void\` | 显示错误Toast |
| \`info\` | \`(message: string, duration?: number) => void\` | 显示信息Toast |
| \`loading\` | \`(message: string, duration?: number) => void\` | 显示加载Toast |
| \`hide\` | \`(id: string) => void\` | 手动隐藏指定Toast |

## 使用场景

1. **成功反馈**：操作成功后的确认提示
2. **错误提示**：操作失败或异常的警告
3. **信息通知**：重要信息的提醒
4. **加载状态**：长时间操作的进度提示

更多详细信息请查看完整的README文档。`;

export default function ToastPlayground() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Toast 组件" />
      <ComponentPlayground
        demos={demos}
        readmeContent={readmeContent}
        subtitle="优雅的消息提示组件"
        title="Toast 组件"
      />
    </SafeAreaView>
  );
}
