---
group: Display
title: Image
description: 图片组件，基于 expo-image，增强了预览功能，支持单图预览和多图画廊。
---

## Features

- ✅ 基于 expo-image，继承所有原生功能
- ✅ **智能自适应尺寸**：根据图片实际大小自动调整显示尺寸，大图缩放，小图原尺寸
- ✅ 支持单图预览（点击图片全屏查看）
- ✅ 支持图片组预览（多图画廊）
- ✅ 支持禁用预览
- ✅ 自动图片缓存
- ✅ 智能 fallback（加载失败时显示占位图，自动适配主题）
- ✅ 主题适配
- ✅ TypeScript 支持

## Basic Usage

### 基础图片

默认情况下，Image 组件会**智能自适应图片尺寸**：

- **大图**：自动缩放到容器宽度，保持宽高比
- **小图**：显示原始尺寸，不拉伸变形

```tsx
import { Image } from '@lobehub/ui-rn';

// 智能自适应（推荐）
// 大图会自动缩放，小图显示原尺寸
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ borderRadius: 8 }}
/>

// 使用 width prop 指定宽度，高度自动计算
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  width={200}
  style={{ borderRadius: 8 }}
/>

// 使用 width 和 height props 指定固定尺寸
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  width="100%"
  height={200}
  contentFit="cover"
/>

// 也可以在 style 中指定尺寸
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200, borderRadius: 8 }}
  contentFit="cover"
/>

// 禁用自适应
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  autoSize={false}
  width="100%"
  height={300}
/>
```

### 可预览的图片

默认情况下，图片支持预览功能，点击图片即可全屏查看：

```tsx
import { Image } from '@lobehub/ui-rn';

<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  preview
  style={{ width: 200, height: 200 }}
/>;
```

### 禁用预览

```tsx
import { Image } from '@lobehub/ui-rn';

<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  preview={false}
  style={{ width: 200, height: 200 }}
/>;
```

### 图片组预览

使用 `Image.PreviewGroup` 组织多个图片，点击任意图片时会打开包含所有图片的画廊：

```tsx
import { Image } from '@lobehub/ui-rn';

const images = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg',
];

<Image.PreviewGroup>
  {images.map((url, index) => (
    <Image key={index} source={{ uri: url }} style={{ width: 100, height: 100 }} />
  ))}
</Image.PreviewGroup>;
```

## API

### Image Props

Image 组件继承了 `expo-image` 的所有 props，并添加了以下属性：

| 属性       | 类型                                                     | 必填 | 默认值           | 描述                                                                |
| ---------- | -------------------------------------------------------- | ---- | ---------------- | ------------------------------------------------------------------- |
| source     | ImageSource                                              | 是   | -                | 图片源（继承自 expo-image）                                         |
| width      | number \| string                                         | 否   | -                | 图片宽度，可以是数字（像素）或字符串（如 '100%'），优先级高于 style |
| height     | number \| string                                         | 否   | -                | 图片高度，可以是数字（像素）或字符串（如 '100%'），优先级高于 style |
| autoSize   | boolean                                                  | 否   | true             | 是否自动调整尺寸。启用时，大图自动缩放，小图显示原尺寸              |
| maxWidth   | number                                                   | 否   | 窗口宽度         | 容器最大宽度（用于自适应计算）                                      |
| preview    | boolean                                                  | 否   | true             | 是否启用预览功能                                                    |
| previewSrc | string                                                   | 否   | -                | 自定义预览时使用的图片 URL（如果与显示的图片不同）                  |
| fallback   | string                                                   | 否   | 自动（根据主题） | 图片加载失败时的占位图（base64 编码的图片字符串）                   |
| contentFit | 'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down' | 否   | 'contain'        | 图片填充模式                                                        |
| style      | StyleProp\<ImageStyle>                                   | 否   | -                | 样式（继承自 expo-image）                                           |
| onLoad     | (event: ImageLoadEventData) => void                      | 否   | -                | 图片加载完成回调                                                    |

### Image.PreviewGroup Props

| 属性     | 类型                  | 必填 | 默认值 | 描述                              |
| -------- | --------------------- | ---- | ------ | --------------------------------- |
| children | ReactNode             | 是   | -      | 子组件（应该包含多个 Image 组件） |
| preview  | boolean               | 否   | true   | 是否启用预览功能                  |
| style    | StyleProp\<ViewStyle> | 否   | -      | 容器样式                          |

## Examples

### 响应式图片网格

```tsx
import { Image } from '@lobehub/ui-rn';
import { StyleSheet, View } from 'react-native';

const images = [
  /* ... */
];

<Image.PreviewGroup>
  <View style={styles.grid}>
    {images.map((url, index) => (
      <Image key={index} source={{ uri: url }} style={styles.gridItem} contentFit="cover" />
    ))}
  </View>
</Image.PreviewGroup>;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
```

### 自定义预览图片

有时显示的是缩略图，预览时希望显示高清大图：

```tsx
import { Image } from '@lobehub/ui-rn';

<Image
  source={{ uri: 'https://example.com/thumbnail.jpg' }}
  previewSrc="https://example.com/fullsize.jpg"
  style={{ width: 200, height: 200 }}
/>;
```

### 加载失败占位图

当图片加载失败时，会自动显示占位图。默认会根据当前主题（亮色 / 暗色）自动选择合适的占位图：

```tsx
import { Image } from '@lobehub/ui-rn';

// 使用默认占位图（自动适配主题）
<Image
  source={{ uri: 'https://invalid-url.jpg' }}
  style={{ width: 200, height: 200 }}
/>

// 自定义占位图（使用 base64 编码的图片）
<Image
  source={{ uri: 'https://invalid-url.jpg' }}
  fallback="data:image/svg+xml;base64,..."
  style={{ width: 200, height: 200 }}
/>
```

## Notes

- Image 组件基于 `expo-image`，享有其所有性能优化和功能
- **智能自适应尺寸**（`autoSize` 默认启用）：
  - 组件会在图片加载完成后获取实际尺寸
  - 如果图片宽度 > 容器宽度，自动缩放并使用 `aspectRatio` 保持比例
  - 如果图片较小，显示原始尺寸，不拉伸变形
  - 如果同时指定了 `width` 和 `height`（通过 props 或 style），自适应会被禁用
- **尺寸指定优先级**：`width`/`height` props > `style` 中的 width/height > 自适应计算
- 如需固定尺寸，可同时指定 `width` 和 `height` props，或设置 `autoSize={false}`
- 预览功能使用 `ImageGallery` 组件和 `imageGallery` 管理器实现
- 在 `PreviewGroup` 中的图片会自动注册到组中，无需手动管理
- 预览模式支持双指缩放、拖动、左右滑动切换等手势操作
- 图片会自动缓存，提升加载性能
- 加载失败时会自动显示占位图，并根据当前主题（亮色 / 暗色）选择合适的样式
- **Markdown 集成**：Image 组件已集成到 Markdown 组件中，所有 Markdown 中的图片都会自动使用 Image 组件渲染，享有自适应和预览功能

## Related Components

- [ImageGallery](/components/image-gallery) - 全屏图片画廊组件
- [Markdown](/components/markdown) - Markdown 渲染组件（已集成 Image）
