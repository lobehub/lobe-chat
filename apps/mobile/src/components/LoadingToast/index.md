---
group: Feedback
title: LoadingToast
description: 居中显示的加载浮层组件，带有可选的取消按钮，适用于长时间异步操作的反馈。
---

## Features

- ✅ 居中浮层设计，不遮挡整个屏幕
- ✅ 自动适配明暗主题
- ✅ 可配置的取消按钮（延迟显示）
- ✅ 禁用背景点击
- ✅ 使用自定义组件（Block、Center、Flexbox）
- ✅ TypeScript 支持

## Basic Usage

```tsx
import { LoadingToast } from '@lobehub/ui-rn';
import { FullWindowOverlay } from '@lobehub/ui-rn';

// 基础用法
<FullWindowOverlay>
  <LoadingToast />
</FullWindowOverlay>

// 带取消回调
<FullWindowOverlay>
  <LoadingToast onCancel={() => console.log('Loading cancelled')} />
</FullWindowOverlay>

// 自定义延迟时间
<FullWindowOverlay>
  <LoadingToast
    cancelDelay={5000}
    onCancel={() => console.log('Cancelled after 5s')}
  />
</FullWindowOverlay>
```

## Use with Loading Utility

通常配合 `loading` 工具使用：

```tsx
import { loading } from '@/libs/loading';

// 包装 Promise
const fetchData = async () => {
  const data = await loading.start(fetch('/api/data').then((res) => res.json()));
  return data;
};

// 手动控制
const { done } = loading.start();
// ... 执行异步操作
done();
```

## API

### LoadingToastProps

| 属性        | 类型         | 默认值 | 说明                           |
| ----------- | ------------ | ------ | ------------------------------ |
| onCancel    | `() => void` | -      | 取消按钮点击回调               |
| cancelDelay | `number`     | `3000` | 显示取消按钮的延迟时间（毫秒） |

## Design Tokens

组件使用以下主题 token：

- `token.borderRadiusLG` - Toast 容器圆角
- `token.colorPrimary` - 加载指示器颜色
- `token.colorBorder` - 取消按钮边框颜色
- `token.colorIcon` - 取消图标颜色

## Notes

- 组件需要包裹在 `FullWindowOverlay` 中才能正确显示在顶层
- 背景点击被禁用，用户只能等待加载完成或点击取消按钮
- 取消按钮默认在 3 秒后显示，避免误触
- 建议配合 `loading` 工具使用，自动管理生命周期
