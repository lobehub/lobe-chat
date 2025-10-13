# Toast 组件

一个优雅的 React Native Toast 通知组件，支持多种类型的消息提示和动画效果。

## 特性

- ✅ **多种类型** - 支持 success、error、info、loading 四种类型
- ✅ **优雅动画** - 流畅的滑入滑出动画效果
- ✅ **自动消失** - 可配置的自动隐藏时间
- ✅ **手动关闭** - 支持点击关闭和手动控制
- ✅ **安全区域** - 自动适配安全区域，避免遮挡状态栏
- ✅ **多实例管理** - 支持同时显示多个 Toast
- ✅ **暗色主题** - 现代化的暗色设计风格
- ✅ **TypeScript** - 完整的 TypeScript 类型支持
- ✅ **Context API** - 基于 React Context 的状态管理
- ✅ **便捷 API** - 简洁易用的调用接口

## 基本用法

### 1. 设置 ToastProvider

```jsx
import { ToastProvider } from '@lobehub/ui-rn';

export default function App() {
  return (
    <ToastProvider>
      {/* 你的应用内容 */}
      <YourAppContent />
    </ToastProvider>
  );
}
```

### 2. 使用 useToast Hook

```jsx
import { useToast } from '@lobehub/ui-rn';

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
```

## API 参考

### useToast Hook

| 方法        | 类型                                             | 描述                   |
| ----------- | ------------------------------------------------ | ---------------------- |
| \`show\`    | \`(config: ToastConfig) => void\`                | 显示自定义配置的 Toast |
| \`success\` | \`(message: string, duration?: number) => void\` | 显示成功 Toast         |
| \`error\`   | \`(message: string, duration?: number) => void\` | 显示错误 Toast         |
| \`info\`    | \`(message: string, duration?: number) => void\` | 显示信息 Toast         |
| \`loading\` | \`(message: string, duration?: number) => void\` | 显示加载 Toast         |
| \`hide\`    | \`(id: string) => void\`                         | 手动隐藏指定 Toast     |

## 使用场景

1. **成功反馈**：操作成功后的确认提示
2. **错误提示**：操作失败或异常的警告
3. **信息通知**：重要信息的提醒
4. **加载状态**：长时间操作的进度提示

更多详细信息请查看完整的 README 文档。
