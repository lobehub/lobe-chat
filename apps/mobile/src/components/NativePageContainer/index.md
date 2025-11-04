---
group: Layout
title: NativePageContainer
description: 原生导航栏页面容器,支持自定义 header、自动返回按钮检测等功能。
---

## Features

- ✅ 原生导航栏集成
- ✅ 自动返回按钮检测 (`autoBack`)
- ✅ 大标题模式支持
- ✅ 自定义左右侧内容
- ✅ 加载状态显示
- ✅ 主题自适应
- ✅ 玻璃效果背景

## Basic Usage

```tsx
import NativePageContainer from '@/components/NativePageContainer';

// 基础用法
<NativePageContainer title="页面标题" showBack>
  {/* 页面内容 */}
</NativePageContainer>

// 自动检测返回按钮
<NativePageContainer title="Playground" autoBack largeTitleEnabled>
  {/* 当导航栈可以返回时,自动显示返回按钮 */}
</NativePageContainer>
```

## API

### Props

| 参数              | 说明                               | 类型                  | 默认值          |
| ----------------- | ---------------------------------- | --------------------- | --------------- |
| autoBack          | 自动检测是否可以返回并显示返回按钮 | `boolean`             | `false`         |
| backgroundColor   | 背景颜色                           | `ColorValue`          | -               |
| children          | 页面内容                           | `ReactNode`           | -               |
| extra             | 右侧额外内容                       | `ReactNode`           | -               |
| largeTitleEnabled | 启用大标题模式                     | `boolean`             | `false`         |
| left              | 自定义左侧内容                     | `ReactNode`           | -               |
| loading           | 显示加载状态                       | `boolean`             | -               |
| onBackPress       | 返回按钮点击回调                   | `() => void`          | `router.back()` |
| searchBarOptions  | iOS 原生搜索栏配置                 | `SearchBarProps`      | -               |
| showBack          | 显示返回按钮                       | `boolean`             | `false`         |
| title             | 标题                               | `ReactNode \| string` | -               |
| titleIcon         | 标题图标                           | `Icon`                | -               |

## Examples

### 自动返回按钮

使用 `autoBack` prop, 组件会自动检测导航栈，当可以返回时显示返回按钮:

```tsx
<NativePageContainer autoBack title="详情页">
  <View>
    {/* 从其他页面跳转过来时,会自动显示返回按钮 */}
    {/* 如果是第一个页面,则不显示 */}
  </View>
</NativePageContainer>
```

### 大标题模式

```tsx
<NativePageContainer largeTitleEnabled title="Playground">
  {/* iOS 会显示大标题,滚动时收缩为普通标题 */}
</NativePageContainer>
```

### 自定义内容

```tsx
<NativePageContainer title="设置" showBack extra={<Button>保存</Button>} loading={isSaving}>
  <View>{/* 内容 */}</View>
</NativePageContainer>
```

### 搜索栏

```tsx
const [searchText, setSearchText] = useState('');
const theme = useTheme();

<NativePageContainer
  title="Playground"
  autoBack
  largeTitleEnabled
  searchBarOptions={{
    cancelButtonText: '取消',
    headerIconColor: theme.colorText,
    hintTextColor: theme.colorText,
    onChangeText: (event) => {
      setSearchText(event.nativeEvent.text);
    },
    placeholder: '搜索组件...',
    shouldShowHintSearchIcon: false,
    textColor: theme.colorText,
    tintColor: theme.colorText,
  }}
>
  <View>{/* 搜索结果 */}</View>
</NativePageContainer>;
```
