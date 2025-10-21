---
group: Feedback
title: Dropdown
description: 下拉菜单组件，支持点击和长按触发，基于 zeego ContextMenu/DropdownMenu 封装。
---

## Features

- ✅ 基于 zeego ContextMenu/DropdownMenu 封装
- ✅ 支持点击和长按两种触发方式
- ✅ 支持 6 种弹出位置配置
- ✅ 支持图标配置
- ✅ 支持破坏性操作样式
- ✅ 支持禁用和隐藏选项
- ✅ TypeScript 类型支持
- ✅ 简化的 API 设计

## Basic Usage

```tsx
import { Dropdown } from '@lobehub/ui-rn';
import { View, Text } from 'react-native';

const options = [
  {
    key: 'copy',
    title: '复制',
    icon: { name: 'doc.on.doc' },
    onSelect: () => console.log('复制'),
  },
  {
    key: 'delete',
    title: '删除',
    icon: { name: 'trash' },
    destructive: true,
    onSelect: () => console.log('删除'),
  },
];

// 长按触发（默认）
<Dropdown options={options}>
  <View>
    <Text>长按显示菜单</Text>
  </View>
</Dropdown>

// 点击触发
<Dropdown options={options} trigger="press">
  <View>
    <Text>点击显示菜单</Text>
  </View>
</Dropdown>

// 自定义弹出位置
<Dropdown options={options} placement="topRight" trigger="press">
  <View>
    <Text>菜单从右上角弹出</Text>
  </View>
</Dropdown>
```

## API

### DropdownProps

| 属性         | 类型                    | 默认值      | 描述                 |
| ------------ | ----------------------- | ----------- | -------------------- |
| children     | ReactNode               | -           | 触发元素             |
| options      | DropdownOptionItem\[]   | -           | 菜单选项列表         |
| trigger      | 'press' \| 'longPress'  | 'longPress' | 触发方式：点击或长按 |
| placement    | DropdownPlacement       | 'bottom'    | 菜单弹出位置         |
| onOpenChange | (open: boolean) => void | -           | 菜单打开 / 关闭回调  |
| open         | boolean                 | -           | 受控模式下的打开状态 |

### DropdownOptionItem

| 属性                      | 类型               | 默认值 | 描述                     |
| ------------------------- | ------------------ | ------ | ------------------------ |
| key                       | string             | -      | 唯一标识                 |
| title                     | string             | -      | 显示文本                 |
| icon                      | DropdownIconConfig | -      | 图标配置                 |
| onSelect                  | () => void         | -      | 点击回调                 |
| destructive               | boolean            | false  | 是否为破坏性操作（红色） |
| disabled                  | boolean            | false  | 是否禁用                 |
| hidden                    | boolean            | false  | 是否隐藏                 |
| shouldDismissMenuOnSelect | boolean            | true   | 是否在选择后关闭菜单     |

### DropdownPlacement

菜单弹出位置，支持以下值：

- `'bottom'` - 下方居中
- `'bottomLeft'` - 下方左对齐
- `'bottomRight'` - 下方右对齐
- `'top'` - 上方居中
- `'topLeft'` - 上方左对齐
- `'topRight'` - 上方右对齐

**⚠️ 重要提示**：

由于 zeego 基于 **iOS/Android 原生菜单 API**，菜单的实际弹出位置受到以下限制：

1. **原生菜单自动定位**：系统会根据触发元素的位置、屏幕剩余空间自动调整菜单位置，以确保菜单完全可见
2. **`placement` 属性可能不生效**：在大多数情况下，iOS 的 `UIContextMenu` 和 `UIMenu` 会忽略开发者指定的 `align` 和 `side`，优先保证用户体验
3. **平台差异**：不同平台（iOS/Android）对菜单定位的控制程度不同

**建议**：不要依赖精确的菜单定位，让系统自动处理是最佳实践。

### DropdownIconConfig

| 属性      | 类型   | 默认值 | 描述                   |
| --------- | ------ | ------ | ---------------------- |
| name      | string | -      | iOS SF Symbol 图标名称 |
| pointSize | number | 18     | 图标尺寸               |

**注意**：由于 zeego 基于原生平台菜单 API，图标只支持 **iOS SF Symbols 系统图标**，不支持自定义 React 组件图标。这是为了保持原生菜单的体验和性能。

**常用 SF Symbol 图标参考**：

| 功能   | 图标名称              | 预览 |
| ------ | --------------------- | ---- |
| 复制   | `doc.on.doc`          | 📄   |
| 编辑   | `pencil`              | ✏️   |
| 删除   | `trash`               | 🗑️   |
| 刷新   | `arrow.clockwise`     | 🔄   |
| 分享   | `square.and.arrow.up` | 📤   |
| 下载   | `arrow.down.circle`   | ⬇️   |
| 设置   | `gear`                | ⚙️   |
| 信息   | `info.circle`         | ℹ️   |
| 星标   | `star`                | ⭐   |
| 心形   | `heart`               | ❤️   |
| 文件夹 | `folder`              | 📁   |
| 图片   | `photo`               | 🖼️   |
| 位置   | `location`            | 📍   |
| 时间   | `clock`               | 🕐   |

更多图标请参考 [Apple SF Symbols](https://developer.apple.com/sf-symbols/)。
