---
group: Form
title: SendButton
description: 聊天发送按钮，支持发送和停止生成两种状态的切换，带有旋转加载动画效果。
---

## Features

- ✅ 两种状态：发送按钮和停止按钮
- ✅ 平滑的状态切换动画
- ✅ 自定义发送和停止回调
- ✅ 继承 Button 组件的所有功能
- ✅ TypeScript 支持
- ✅ 主题适配

## Basic Usage

```tsx
import { SendButton } from '@lobehub/ui-rn';

// 基础用法
<SendButton onSend={() => console.log('发送')} />

// 生成中状态
<SendButton
  generating
  onStop={() => console.log('停止生成')}
/>
```

## API

### SendButtonProps

| 属性       | 类型                             | 默认值    | 描述                                     |
| ---------- | -------------------------------- | --------- | ---------------------------------------- |
| generating | `boolean`                        | `false`   | 是否正在生成消息，为 true 时显示停止按钮 |
| onSend     | `() => void`                     | -         | 点击发送按钮的回调                       |
| onStop     | `() => void`                     | -         | 点击停止按钮的回调                       |
| size       | `'small' \| 'middle' \| 'large'` | `'small'` | 按钮尺寸                                 |

继承 `ButtonProps` 的其他所有属性（除了 `onPress`、`icon`、`loading`）。
