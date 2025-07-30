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

## 安装

Toast 组件依赖以下包：

```bash
# 必需依赖
npm install react-native-safe-area-context
npx expo install @expo/vector-icons

# 如果使用bare React Native项目
npm install react-native-vector-icons
```

## 基本用法

### 1. 设置 ToastProvider

首先需要在应用的根组件中包装 ToastProvider：

```jsx
import { ToastProvider } from '@/components/Toast/ToastProvider';

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

在组件中使用 Toast：

```jsx
import { useToast } from '@/components/Toast/ToastProvider';

export default function MyComponent() {
  const toast = useToast();

  const showSuccess = () => {
    toast.success('操作成功！');
  };

  const showError = () => {
    toast.error('操作失败，请重试');
  };

  const showInfo = () => {
    toast.info('这是一条信息提示');
  };

  const showLoading = () => {
    toast.loading('加载中...', 3000);
  };

  return (
    <View>
      <Button title="成功提示" onPress={showSuccess} />
      <Button title="错误提示" onPress={showError} />
      <Button title="信息提示" onPress={showInfo} />
      <Button title="加载提示" onPress={showLoading} />
    </View>
  );
}
```

## API 参考

### ToastProvider

Toast 的 Context Provider 组件。

#### Props

| 属性       | 类型        | 默认值 | 描述              |
| ---------- | ----------- | ------ | ----------------- |
| `children` | `ReactNode` | -      | **必需** - 子组件 |

### useToast Hook

返回 Toast 控制方法的 Hook。

#### 返回值

| 方法      | 类型                                           | 描述                   |
| --------- | ---------------------------------------------- | ---------------------- |
| `show`    | `(config: ToastConfig) => void`                | 显示自定义配置的 Toast |
| `success` | `(message: string, duration?: number) => void` | 显示成功 Toast         |
| `error`   | `(message: string, duration?: number) => void` | 显示错误 Toast         |
| `info`    | `(message: string, duration?: number) => void` | 显示信息 Toast         |
| `loading` | `(message: string, duration?: number) => void` | 显示加载 Toast         |
| `hide`    | `(id: string) => void`                         | 手动隐藏指定 Toast     |

### ToastConfig

Toast 配置对象的类型定义。

```typescript
interface ToastConfig {
  message: string; // Toast消息内容
  type: ToastType; // Toast类型
  duration?: number; // 显示时长（毫秒），默认2000
}

type ToastType = 'success' | 'error' | 'info' | 'loading';
```

### Toast 组件

基础 Toast 组件，通常不需要直接使用。

#### Props

| 属性       | 类型                   | 默认值 | 描述                      |
| ---------- | ---------------------- | ------ | ------------------------- |
| `id`       | `string`               | -      | **必需** - Toast 唯一标识 |
| `message`  | `string`               | -      | **必需** - 显示的消息内容 |
| `type`     | `ToastType`            | -      | **必需** - Toast 类型     |
| `duration` | `number`               | `2000` | 显示时长（毫秒）          |
| `opacity`  | `Animated.Value`       | -      | **必需** - 透明度动画值   |
| `onClose`  | `(id: string) => void` | -      | 关闭回调函数              |

## 使用示例

### 基础用法

```jsx
import { useToast } from '@/components/Toast/ToastProvider';

function BasicExample() {
  const toast = useToast();

  return (
    <View>
      <Button title="显示成功提示" onPress={() => toast.success('保存成功！')} />
      <Button title="显示错误提示" onPress={() => toast.error('网络错误，请检查连接')} />
    </View>
  );
}
```

### 自定义时长

```jsx
function CustomDurationExample() {
  const toast = useToast();

  const showLongToast = () => {
    toast.info('这条消息会显示5秒钟', 5000);
  };

  const showShortToast = () => {
    toast.success('快速提示', 1000);
  };

  return (
    <View>
      <Button title="长时间显示" onPress={showLongToast} />
      <Button title="短时间显示" onPress={showShortToast} />
    </View>
  );
}
```

### 加载状态

```jsx
function LoadingExample() {
  const toast = useToast();

  const handleAsyncOperation = async () => {
    // 显示加载提示
    toast.loading('正在处理中...', 10000); // 10秒自动隐藏

    try {
      await someAsyncOperation();
      toast.success('操作完成！');
    } catch (error) {
      toast.error('操作失败：' + error.message);
    }
  };

  return <Button title="执行异步操作" onPress={handleAsyncOperation} />;
}
```

### 高级配置

```jsx
function AdvancedExample() {
  const toast = useToast();

  const showCustomToast = () => {
    toast.show({
      message: '这是一个自定义配置的Toast',
      type: 'info',
      duration: 3000,
    });
  };

  return <Button title="自定义Toast" onPress={showCustomToast} />;
}
```

## 样式定制

### 主题色彩

Toast 组件使用固定的颜色方案，确保在暗色主题下的最佳显示效果：

```javascript
const colors = {
  success: '#52C41A', // 绿色
  error: '#FF4D4F', // 红色
  info: '#1890FF', // 蓝色
  loading: '#1890FF', // 蓝色
  background: '#1C1C1E', // 深灰背景
  text: '#FFFFFF', // 白色文字
  border: 'rgba(255, 255, 255, 0.1)', // 半透明边框
};
```

### 自定义样式

如果需要修改样式，可以编辑`Toast.tsx`文件中的样式定义：

```javascript
const styles = StyleSheet.create({
  toast: {
    backgroundColor: '#1C1C1E', // 背景色
    borderRadius: 8, // 圆角
    borderWidth: 0.5, // 边框宽度
    borderColor: 'rgba(255, 255, 255, 0.1)', // 边框色
    paddingHorizontal: 16, // 水平内边距
    paddingVertical: 12, // 垂直内边距
    // ... 其他样式
  },
  message: {
    color: '#FFFFFF', // 文字颜色
    fontSize: 14, // 字体大小
    fontWeight: '500', // 字体粗细
    // ... 其他文字样式
  },
});
```

## 动画效果

Toast 组件包含以下动画效果：

### 入场动画

- **透明度**：从 0 到 1 的渐显效果
- **位移**：从向上 10px 到正常位置的滑入效果
- **时长**：150 毫秒

### 出场动画

- **透明度**：从 1 到 0 的渐隐效果
- **位移**：从正常位置到向上 10px 的滑出效果
- **时长**：100 毫秒

### 自定义动画

如果需要修改动画效果，可以调整`ToastProvider.tsx`中的动画参数：

```javascript
// 入场动画
Animated.parallel([
  Animated.timing(opacity, {
    toValue: 1,
    duration: 150, // 修改动画时长
    useNativeDriver: true,
  }),
  Animated.timing(translateY, {
    toValue: 0,
    duration: 150, // 修改动画时长
    useNativeDriver: true,
  }),
]).start();
```

## 定位系统

### 自动定位

Toast 会自动定位在屏幕顶部，考虑以下因素：

- **安全区域**：自动适配设备的安全区域（刘海屏、动态岛等）
- **状态栏高度**：避免被状态栏遮挡
- **导航栏高度**：预留导航栏空间（44px）

### 定位计算

```javascript
const topPosition = insets.top + 44 + 8;
// insets.top: 安全区域顶部高度
// 44: 导航栏标准高度
// 8: 额外间距
```

## 多实例管理

### 并发显示

Toast 支持同时显示多个实例：

```jsx
function MultipleToastExample() {
  const toast = useToast();

  const showMultiple = () => {
    toast.success('第一条消息');
    toast.info('第二条消息');
    toast.error('第三条消息');
  };

  return <Button title="显示多条Toast" onPress={showMultiple} />;
}
```

### 队列管理

- 新的 Toast 会添加到现有 Toast 之上
- 每个 Toast 独立管理自己的生命周期
- 自动清理过期的 Toast 实例

## 性能优化

### 内存管理

- 使用`Animated.Value`实现高性能动画
- 自动清理定时器，防止内存泄漏
- 组件卸载时清理所有 Toast 实例

### 渲染优化

- 使用`useNativeDriver`启用原生动画
- 避免不必要的重渲染
- 合理的组件结构设计

## 故障排除

### 常见问题

1. **Toast 不显示**
   - 确保已正确包装 ToastProvider
   - 检查是否在 Provider 内部使用 useToast
   - 验证消息内容不为空

2. **样式异常**
   - 检查安全区域配置是否正确
   - 确认图标库已正确安装
   - 验证动画值的初始化

3. **动画卡顿**
   - 确保使用了`useNativeDriver: true`
   - 检查是否有复杂的同步操作
   - 优化组件渲染性能

4. **多实例冲突**
   - 检查 Toast ID 的唯一性
   - 确认定时器清理逻辑
   - 验证状态管理是否正确

### 调试建议

1. 使用 React DevTools 查看 Toast 状态
2. 检查 console 中的错误信息
3. 验证 Provider 的层级结构
4. 测试不同设备的显示效果

## 最佳实践

### 消息设计

1. **简洁明了**：Toast 消息应该简短清晰
2. **用户友好**：使用用户容易理解的语言
3. **区分类型**：正确使用不同类型的 Toast
4. **避免重复**：防止相同消息的重复显示

### 使用场景

1. **成功反馈**：操作成功后的确认提示
2. **错误提示**：操作失败或异常的警告
3. **信息通知**：重要信息的提醒
4. **加载状态**：长时间操作的进度提示

### 时长设置

- **成功提示**：1-2 秒（用户已完成操作）
- **错误提示**：3-4 秒（用户需要阅读错误信息）
- **信息提示**：2-3 秒（根据内容长度调整）
- **加载提示**：根据操作耗时动态调整

### 代码组织

```jsx
// 推荐的使用方式
const toast = useToast();

const handleSave = async () => {
  try {
    toast.loading('保存中...');
    await saveData();
    toast.success('保存成功！');
  } catch (error) {
    toast.error(`保存失败：${error.message}`);
  }
};
```

## 示例代码

查看`demos/`目录下的完整示例：

- `basic.tsx` - 基础用法示例
- `types.tsx` - 不同类型的 Toast
- `advanced.tsx` - 高级功能示例
- `integration.tsx` - 与其他组件的集成示例
