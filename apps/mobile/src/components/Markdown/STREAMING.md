# Streaming Animation in React Native

## 概述

在 React Native 中，Markdown 的流式动画效果与 Web 版本的实现方式不同。

## Web vs React Native

### Web 版本 (使用 CSS)

Web 版本使用 `rehypeStreamAnimated` 插件：

- 将文本节点拆分成单词 / 字符
- 为每个片段添加 `className: 'animate-fade-in'`
- 通过 CSS 动画实现渐入效果

```typescript
// Web 版本
{
  children: [{ type: 'text', value: 'word' }],
  properties: {
    className: 'animate-fade-in',  // ✅ Web 中有效
  },
  tagName: 'span',
  type: 'element',
}
```

### React Native 版本 (使用组件渲染)

React Native **不支持** CSS `className`，因此采用不同的策略：

#### 流式效果实现方式

1. **StreamdownRender 组件**
   - 使用 `marked.lexer()` 将内容分解成块
   - 逐块渲染 Markdown 内容
   - 每个块独立渲染，自然形成 "流式" 效果

```typescript
// src/components/Markdown/SyntaxMarkdown/StreamdownRender.tsx
const parseMarkdownIntoBlocks = (markdown: string): string[] => {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
};

// 逐块渲染
{blocks.map((block, index) => (
  <StreamdownBlock key={`${id}-block_${index}`}>
    {block}
  </StreamdownBlock>
))}
```

2. **延迟动画控制**
   - 使用 `useDelayedAnimated` hook
   - 当 `animated` 从 `true` 变为 `false` 时，延迟 1 秒
   - 确保流式内容结束时的平滑过渡

```typescript
// src/components/Markdown/components/useDelayedAnimated.ts
const delayedAnimated = useDelayedAnimated(animated);

// 控制是否启用流式渲染
<Render enableStream={enableStream && delayedAnimated}>
  {children}
</Render>
```

## 为什么不使用 rehypeStreamAnimated

在 React Native 中，`rehypeStreamAnimated` 插件：

- ❌ 添加的 `className` 属性无效
- ❌ CSS 动画不被支持
- ❌ 会增加不必要的 DOM 节点

因此，我们选择：

- ✅ 不使用 `rehypeStreamAnimated` 插件
- ✅ 依赖 `StreamdownRender` 的逐块渲染
- ✅ 使用 `useDelayedAnimated` 控制流式状态

## 如果需要添加动画效果

如果未来需要在 React Native 中添加渐入动画，可以：

### 方案 1: 使用 React Native Animated API

修改 `StreamdownBlock` 组件：

```typescript
import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

const StreamdownBlock = ({ children, ...rest }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <ReactNativeMarkdown {...rest}>{children}</ReactNativeMarkdown>
    </Animated.View>
  );
};
```

### 方案 2: 使用 react-native-reanimated

```typescript
import Animated, { FadeIn } from 'react-native-reanimated';

const StreamdownBlock = ({ children, index, ...rest }) => {
  return (
    <Animated.View entering={FadeIn.delay(index * 50)}>
      <ReactNativeMarkdown {...rest}>{children}</ReactNativeMarkdown>
    </Animated.View>
  );
};
```

## 总结

| 特性         | Web 版本                  | React Native 版本               |
| ------------ | ------------------------- | ------------------------------- |
| **动画实现** | CSS `animate-fade-in`     | 逐块渲染（可选：Animated API）  |
| **插件**     | `rehypeStreamAnimated` ✅ | `rehypeStreamAnimated` ❌       |
| **流式效果** | 逐字符 / 词渐入           | 逐块渐显                        |
| **延迟控制** | `useDelayedAnimated` ✅   | `useDelayedAnimated` ✅         |
| **性能**     | CSS 动画（GPU 加速）      | React 渲染（可选：Native 动画） |

## 相关文件

- `src/components/Markdown/Markdown.tsx` - 主组件，使用 `useDelayedAnimated`
- `src/components/Markdown/SyntaxMarkdown/StreamdownRender.tsx` - 流式渲染实现
- `src/components/Markdown/components/useDelayedAnimated.ts` - 延迟动画控制
- `src/components/hooks/useMarkdown/useMarkdownRehypePlugins.ts` - Rehype 插件配置（不含 `rehypeStreamAnimated`）
