const FLEXBOX_README = `# Flexbox 弹性布局组件

基于 React Native Flexbox 布局的容器组件，提供了简洁的 API 来控制子元素的排列和对齐方式。

## 功能特性

- ✅ 简洁的 Flexbox 属性封装
- ✅ 完全兼容 React Native
- ✅ 支持所有 Flexbox 布局属性
- ✅ 支持自动换行和 flex 属性
- ✅ 内置测试 ID 支持
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import { Flexbox } from '@lobehub/ui-rn';

// 水平排列
<Flexbox direction="row" justify="center" align="center">
  <Component1 />
  <Component2 />
  <Component3 />
</Flexbox>

// 垂直排列
<Flexbox direction="column" justify="space-between">
  <Component1 />
  <Component2 />
  <Component3 />
</Flexbox>

// 自动换行
<Flexbox direction="row" wrap="wrap" justify="space-around">
  <Component1 />
  <Component2 />
  <Component3 />
  <Component4 />
</Flexbox>

// 填充模式
<Flexbox block direction="row" justify="center">
  <Component1 />
  <Component2 />
</Flexbox>
\`\`\`

## API

### FlexboxProps

| 属性      | 类型                   | 默认值         | 说明               |
| --------- | ---------------------- | -------------- | ------------------ |
| direction | \`FlexDirection\`        | \`'column'\`     | 主轴的方向         |
| justify   | \`JustifyContent\`       | \`'flex-start'\` | 主轴上的对齐方式   |
| align     | \`AlignItems\`           | \`'stretch'\`    | 交叉轴上的对齐方式 |
| wrap      | \`FlexWrap\`             | \`'nowrap'\`     | 是否换行           |
| flex      | \`number\`               | -              | flex 属性          |
| block     | \`boolean\`              | \`false\`        | 是否填充可用空间   |
| children  | \`ReactNode\`            | -              | 子元素             |
| style     | \`StyleProp<ViewStyle>\` | -              | 自定义样式         |
| testID    | \`string\`               | -              | 测试 ID            |

### 类型定义

\`\`\`tsx
type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
\`\`\`

## 布局方向

- \`row\`: 水平排列，从左到右
- \`column\`: 垂直排列，从上到下
- \`row-reverse\`: 水平排列，从右到左
- \`column-reverse\`: 垂直排列，从下到上

## 对齐方式

### 主轴对齐 (justify)
- \`flex-start\`: 起始端对齐
- \`flex-end\`: 末尾端对齐
- \`center\`: 居中对齐
- \`space-between\`: 两端对齐，项目之间间隔相等
- \`space-around\`: 每个项目两侧间隔相等
- \`space-evenly\`: 所有间隔都相等

### 交叉轴对齐 (align)
- \`stretch\`: 拉伸填满容器
- \`flex-start\`: 起始端对齐
- \`flex-end\`: 末尾端对齐
- \`center\`: 居中对齐
- \`baseline\`: 基线对齐
`;

export default FLEXBOX_README;
