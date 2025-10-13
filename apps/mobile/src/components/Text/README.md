# Text 文本组件

用于显示文本的基础组件，提供丰富的样式和语义化选项。

## 何时使用

- 需要显示标题、段落等文本内容
- 需要对文本进行语义化标记（成功、警告、危险等）
- 需要对文本进行样式处理（加粗、斜体、下划线等）
- 需要处理文本溢出和省略

## 代码演示

### 基础用法

<code src="./demos/basic.tsx"></code>

### 标题

<code src="./demos/heading.tsx"></code>

### 语义化类型

<code src="./demos/semantic.tsx"></code>

### 自定义样式

<code src="./demos/styling.tsx"></code>

### 省略号

<code src="./demos/ellipsis.tsx"></code>

### 组合使用

<code src="./demos/combination.tsx"></code>

## API

### TextProps

| 属性          | 类型                                                          | 默认值  | 说明                     |
| ------------- | ------------------------------------------------------------- | ------- | ------------------------ |
| as            | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'p'`                 | -       | 标签类型，影响字号和字重 |
| type          | `'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | -       | 语义化类型，影响颜色     |
| strong        | `boolean`                                                     | `false` | 是否加粗                 |
| italic        | `boolean`                                                     | `false` | 是否斜体                 |
| underline     | `boolean`                                                     | `false` | 是否下划线               |
| delete        | `boolean`                                                     | `false` | 是否删除线               |
| mark          | `boolean`                                                     | `false` | 是否标记 / 高亮          |
| code          | `boolean`                                                     | `false` | 是否代码样式             |
| disabled      | `boolean`                                                     | `false` | 是否禁用状态             |
| color         | `string`                                                      | -       | 自定义文本颜色           |
| weight        | `TextStyle['fontWeight']`                                     | -       | 自定义字重               |
| fontSize      | `number`                                                      | -       | 自定义字号               |
| align         | `'left' \| 'center' \| 'right' \| 'justify' \| 'auto'`        | -       | 文本对齐方式             |
| ellipsis      | `boolean \| { rows?: number; suffix?: string }`               | -       | 省略号配置               |
| numberOfLines | `number`                                                      | -       | 限制行数                 |
| style         | `TextStyle`                                                   | -       | 自定义样式               |

### 继承属性

继承自 React Native `Text` 组件的所有属性。

## 样式说明

### 标签类型 (as)

- `h1`: 38px, 加粗
- `h2`: 30px, 加粗
- `h3`: 24px, 加粗
- `h4`: 20px, 加粗
- `h5`: 16px, 加粗
- `p`: 14px, 正常

### 语义化类型 (type)

- `secondary`: 次要文本色
- `success`: 成功色（绿色）
- `warning`: 警告色（橙色）
- `danger`: 危险色（红色）
- `info`: 信息色（蓝色）

### 布尔属性

- `strong`: 应用加粗字重
- `italic`: 应用斜体样式
- `underline`: 添加下划线
- `delete`: 添加删除线
- `mark`: 添加黄色背景高亮
- `code`: 应用代码样式（等宽字体、浅灰背景）
- `disabled`: 应用禁用样式（浅灰文本）

## 注意事项

1. `as` 和自定义 `fontSize` 可以同时使用，自定义值会覆盖默认值
2. `type` 和自定义 `color` 可以同时使用，自定义值会覆盖默认值
3. `strong` 和自定义 `weight` 可以同时使用，自定义值会覆盖默认值
4. `ellipsis` 会自动设置 `numberOfLines`，但显式设置的 `numberOfLines` 优先级更高
5. 多个布尔属性可以组合使用（如 `strong` + `underline` + `italic`）
