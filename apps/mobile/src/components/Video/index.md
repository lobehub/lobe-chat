---
group: Display
title: Video
description: 视频播放组件，基于 expo-video，支持自适应尺寸、自动播放、循环播放等功能。
---

## Features

- ✅ 基于 expo-video，继承所有原生功能
- ✅ **智能自适应尺寸**：根据宽高比自动调整显示尺寸
- ✅ 支持自动播放和循环播放
- ✅ 支持全屏播放
- ✅ 支持画中画模式
- ✅ 原生视频控制器
- ✅ 主题适配
- ✅ TypeScript 支持

## Basic Usage

### 基础视频

默认情况下，Video 组件会按 16:9 的宽高比显示：

```tsx
import { Video } from '@lobehub/ui-rn';

// 基础用法
<Video source="https://example.com/video.mp4" />

// 指定宽度
<Video
  source="https://example.com/video.mp4"
  width={300}
/>

// 自定义宽高比
<Video
  source="https://example.com/video.mp4"
  aspectRatio={1} // 1:1 正方形
  width={200}
/>
```

### 自动播放和循环

```tsx
import { Video } from '@lobehub/ui-rn';

// 自动播放（建议静音）
<Video
  source="https://example.com/video.mp4"
  autoPlay
  muted
/>

// 循环播放
<Video
  source="https://example.com/video.mp4"
  loop
  autoPlay
  muted
/>
```

### 自定义样式

```tsx
import { Video } from '@lobehub/ui-rn';

<Video source="https://example.com/video.mp4" variant="outlined" borderRadius={16} width="100%" />;
```

## API

### Video Props

Video 组件继承了 `expo-video` 的 `VideoViewProps`，并添加了以下属性：

| 属性                  | 类型                                   | 必填 | 默认值               | 描述                                              |
| --------------------- | -------------------------------------- | ---- | -------------------- | ------------------------------------------------- |
| source                | string                                 | 是   | -                    | 视频源 URL                                        |
| width                 | number \| string                       | 否   | '100%'               | 视频宽度，可以是数字（像素）或字符串（如 '100%'） |
| height                | number \| string                       | 否   | -                    | 视频高度，如果不指定，根据 aspectRatio 自动计算   |
| aspectRatio           | number                                 | 否   | 16/9                 | 视频宽高比                                        |
| autoPlay              | boolean                                | 否   | false                | 是否自动播放                                      |
| loop                  | boolean                                | 否   | false                | 是否循环播放                                      |
| muted                 | boolean                                | 否   | false                | 是否静音                                          |
| showControls          | boolean                                | 否   | true                 | 是否显示原生控制器                                |
| allowFullscreen       | boolean                                | 否   | true                 | 是否允许全屏                                      |
| allowPictureInPicture | boolean                                | 否   | true                 | 是否允许画中画                                    |
| maxWidth              | number                                 | 否   | 窗口宽度             | 容器最大宽度（用于自适应计算）                    |
| variant               | 'filled' \| 'outlined' \| 'borderless' | 否   | 'filled'             | 容器样式变体                                      |
| borderRadius          | number                                 | 否   | theme.borderRadiusLG | 容器圆角                                          |
| contentFit            | 'contain' \| 'cover' \| 'fill'         | 否   | 'cover'              | 视频填充模式                                      |
| style                 | StyleProp\<ViewStyle>                  | 否   | -                    | 容器样式                                          |

## Notes

- Video 组件基于 `expo-video`，享有其所有性能优化和功能
- **智能自适应尺寸**：
  - 默认宽度为 100%，高度根据 aspectRatio 自动计算
  - 可以通过 width 和 height props 指定固定尺寸
  - 支持响应式布局
- **自动播放注意事项**：
  - 自动播放时建议设置 `muted={true}`，否则可能被浏览器 / 系统阻止
  - 移动设备上自动播放可能受到系统限制
- **性能优化**：
  - 视频会自动缓存
  - 支持硬件加速
  - 支持画中画模式，提升用户体验
- **Markdown 集成**：Video 组件已集成到 Markdown 组件中，所有 Markdown 中的 `<video>` 标签都会自动使用 Video 组件渲染

## Related Components

- [Image](/components/image) - 图片组件
- [Markdown](/components/markdown) - Markdown 渲染组件（已集成 Video）
