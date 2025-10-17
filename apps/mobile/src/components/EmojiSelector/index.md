---
group: Form
title: EmojiSelector
description: A comprehensive emoji picker component with category tabs, search functionality, and flexible state management.
---

## Features

- ✅ 分类浏览 - 支持 8 个 emoji 分类（Activities、Emotion、Food、Nature、Objects、People、Places、Symbols）
- ✅ Segmented 控制器 - 使用项目的 Segmented 组件实现分类选择
- ✅ 搜索功能 - 使用 Input.Search 组件快速搜索 emoji
- ✅ 受控 / 非受控模式 - 灵活的状态管理
- ✅ 高性能 - 使用 FlatList 虚拟列表，只渲染可见区域
- ✅ 主题适配 - 自动适配明暗主题
- ✅ TypeScript 支持 - 完整的类型定义
- ✅ 轻量实现 - 移除 TabView，减少性能开销

## Basic Usage

```tsx
import { EmojiSelector } from '@lobehub/ui-rn';
import { useState } from 'react';

const App = () => {
  const [emoji, setEmoji] = useState('');

  return (
    <EmojiSelector
      value={emoji}
      onChange={(emoji) => {
        console.log('Selected:', emoji);
        setEmoji(emoji);
      }}
    />
  );
};
```

## Categories

The component includes 8 emoji categories (alphabetically ordered):

1. **Activities** - ⚾️ 活动
2. **Smileys & Emotion** - 😀 笑脸和情感
3. **Food & Drink** - 🍔 食物和饮料
4. **Animals & Nature** - 🦄 动物和自然
5. **Objects** - 💡 物品
6. **People & Body** - 🧑 人物和身体
7. **Travel & Places** - ✈️ 旅行和地点
8. **Symbols** - 🔣 符号

## API

### EmojiSelectorProps

| 属性            | 类型                              | 默认值                  | 说明                                                      |
| --------------- | --------------------------------- | ----------------------- | --------------------------------------------------------- |
| `onChange`      | `(emoji: string) => void`         | -                       | 选中 emoji 的回调                                         |
| `value`         | `string`                          | -                       | 受控值                                                    |
| `defaultValue`  | `string`                          | `''`                    | 默认值（非受控模式）                                      |
| `category`      | `EmojiCategory`                   | `Categories.activities` | 初始选中的分类                                            |
| `columns`       | `number`                          | 自动计算                | 每行显示的列数（不设置则根据屏幕宽度自动计算，范围 6-12） |
| `emojiSize`     | `number`                          | `48`                    | 单个 emoji 的尺寸（用于自动计算列数）                     |
| `placeholder`   | `string`                          | `'Search...'`           | 搜索框占位符                                              |
| `showSearchBar` | `boolean`                         | `true`                  | 是否显示搜索栏                                            |
| `showTabs`      | `boolean`                         | `true`                  | 是否显示分类标签                                          |
| `shouldInclude` | `(emoji: EmojiObject) => boolean` | -                       | 过滤 emoji 的函数                                         |

### Categories Export

```tsx
import { Categories } from '@lobehub/ui-rn';

// 可用的分类（按字母顺序）
Categories.activities; // 活动
Categories.emotion; // 笑脸和情感
Categories.food; // 食物和饮料
Categories.nature; // 动物和自然
Categories.objects; // 物品
Categories.people; // 人物和身体
Categories.places; // 旅行和地点
Categories.symbols; // 符号
```

### Utility Functions

```tsx
import { charFromEmojiObject } from '@lobehub/ui-rn';

// 将 emoji 对象转换为字符
const emojiChar = charFromEmojiObject(emojiObject);
```

## Examples

### Controlled Mode

Use `value` and `onChange` for controlled component:

```tsx
const [emoji, setEmoji] = useState('😀');

<EmojiSelector value={emoji} onChange={setEmoji} />;
```

### Uncontrolled Mode

Use `defaultValue` for uncontrolled component:

```tsx
<EmojiSelector defaultValue="😀" onChange={(emoji) => console.log('Selected:', emoji)} />
```

### Auto Columns (Responsive)

By default, columns are calculated based on screen width:

```tsx
<EmojiSelector
  onChange={(emoji) => console.log(emoji)}
  // columns 会根据屏幕宽度自动计算（范围 6-12）
/>
```

### Custom Columns

Or manually set the number of columns:

```tsx
<EmojiSelector columns={8} onChange={(emoji) => console.log(emoji)} />
```

### Custom Emoji Size

Adjust emoji size for auto-calculation:

```tsx
<EmojiSelector
  emojiSize={56} // 更大的 emoji，会自动调整列数
  onChange={(emoji) => console.log(emoji)}
/>
```

### Filter Emojis

Filter which emojis to display:

```tsx
<EmojiSelector
  shouldInclude={(emoji) => {
    // Only show emojis from specific categories
    return emoji.category === 'Smileys & Emotion';
  }}
  onChange={(emoji) => console.log(emoji)}
/>
```

### Minimal UI

Hide tabs and search for a simpler interface:

```tsx
<EmojiSelector
  showTabs={false}
  showSearchBar={false}
  category={Categories.emotion}
  onChange={(emoji) => console.log(emoji)}
/>
```

## Notes

- 支持受控和非受控两种模式
- 使用 `Segmented` 组件实现分类选择器，提供平滑的动画效果
- 使用 `Input.Search` 组件实现搜索功能，自动适配主题
- 使用 FlatList 虚拟列表优化性能，只渲染可见区域的 emoji
- **响应式列数**：根据屏幕宽度自动计算列数，适配不同设备
- 切换分类时自动重新渲染当前分类内容
- 自动适配明暗主题
- 支持搜索 emoji 的短名称（short names）
- 使用 `useMergeState` 实现灵活的状态管理
- 轻量化实现：移除 TabView 依赖，减少性能开销
