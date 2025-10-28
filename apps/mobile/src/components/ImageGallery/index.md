---
group: Display
title: ImageGallery
description: 全屏图片画廊组件，支持缩放、拖动和多图浏览。
---

## Features

- ✅ 全屏图片查看
- ✅ 双指缩放和拖动
- ✅ 多图浏览（左右滑动）
- ✅ 自适应图片尺寸
- ✅ 安全区域适配
- ✅ 主题适配
- ✅ TypeScript 支持

## Basic Usage

通常通过 `imageGallery` 管理器来使用：

```tsx
import { imageGallery } from '@/libs/imageGallery';

// 显示单张图片
imageGallery.show(['https://example.com/image.jpg'], 0);

// 显示多张图片
imageGallery.show(
  [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ],
  0,
);

// 关闭画廊
imageGallery.close();
```

## Direct Component Usage

如果需要直接使用组件：

```tsx
import { ImageGallery } from '@lobehub/ui-rn';
import { useState } from 'react';

const App = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setVisible(true)}>查看图片</Button>
      {visible && (
        <ImageGallery
          images={['https://example.com/image1.jpg', 'https://example.com/image2.jpg']}
          initialIndex={0}
          onClose={() => setVisible(false)}
        />
      )}
    </>
  );
};
```

## API

### ImageGalleryProps

| 属性         | 类型       | 必填 | 默认值 | 描述               |
| ------------ | ---------- | ---- | ------ | ------------------ |
| images       | string\[]  | 是   | -      | 图片 URL 数组      |
| initialIndex | number     | 否   | 0      | 初始显示的图片索引 |
| onClose      | () => void | 是   | -      | 关闭回调           |

## Gallery Manager API

### imageGallery.show()

显示图片画廊。

```tsx
imageGallery.show(images: string[], initialIndex?: number): void
```

**参数：**

- `images` - 图片 URL 数组
- `initialIndex` - 初始显示的图片索引，默认为 0

### imageGallery.close()

关闭图片画廊。

```tsx
imageGallery.close(): void
```

## Features

### 手势支持

- **双指缩放**：缩放图片查看细节
- **拖动**：缩放后拖动图片
- **左右滑动**：切换上一张 / 下一张图片
- **点击关闭按钮**：退出全屏模式

### 自适应尺寸

- 大图自动适应屏幕尺寸
- 小图保持原始比例
- 横竖屏自动适配

### 主题集成

- 自动使用当前主题的遮罩颜色
- 关闭按钮使用主题色
- 安全区域自动适配

## Notes

- 该组件基于 `react-native-zoom-toolkit` 实现
- 使用 `react-native-root-siblings` 实现全屏覆盖
- 图片使用 `expo-image` 加载，支持缓存
- 在 Markdown 组件中的图片默认支持点击全屏查看
