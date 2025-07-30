# Markdown 组件

一个功能强大的 React Native Markdown 渲染组件，支持数学公式、代码高亮、图片、视频等多种内容类型。

## 特性

- ✅ **数学公式渲染** - 支持 MathJax 数学公式显示
- ✅ **代码高亮** - 集成自定义 Highlighter 组件
- ✅ **图片自适应** - 自动计算图片高度，响应式显示
- ✅ **视频支持** - 支持视频内容渲染
- ✅ **表格支持** - 完整的表格样式和布局
- ✅ **深色主题** - 自动适配暗色 / 亮色主题
- ✅ **自定义样式** - 丰富的样式配置选项
- ✅ **链接支持** - 可点击链接和自动跳转
- ✅ **列表支持** - 有序列表和无序列表
- ✅ **引用块** - 支持 blockquote 样式

## 安装

```bash
# 基础依赖
npm install react-native-markdown-display react-native-mathjax-html-to-svg
npm install markdown-it markdown-it-mathjax3

# Expo相关依赖
npx expo install expo-av
```

## 基本用法

```jsx
import MarkdownRender from '@/mobile/components/Markdown';

export default function App() {
  const markdownContent = `
# 标题示例

这是一个**粗体文本**和*斜体文本*示例。

## 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello World!');
}
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$
  `;

  return <MarkdownRender content={markdownContent} />;
}
```

## API 参考

### Props

| 属性             | 类型     | 默认值 | 描述                              |
| ---------------- | -------- | ------ | --------------------------------- |
| `content`        | `string` | -      | **必需** - 要渲染的 Markdown 内容 |
| `fontSize`       | `number` | `16`   | 基础字体大小（px）                |
| `headerMultiple` | `number` | `1`    | 标题字体大小倍数                  |
| `marginMultiple` | `number` | `1.5`  | 边距倍数                          |
| `lineHeight`     | `number` | `1.8`  | 行高倍数                          |

### 样式配置

组件会根据传入的 props 自动计算各元素的样式：

- **标题样式**：根据`headerMultiple`调整 H1-H6 的字体大小
- **边距样式**：根据`marginMultiple`统一调整元素间距
- **行高样式**：根据`lineHeight`调整文本行高
- **主题适配**：自动使用 React Navigation 的主题色彩

## 支持的 Markdown 语法

### 标题

```markdown
# H1 标题

## H2 标题

### H3 标题

#### H4 标题

##### H5 标题

###### H6 标题
```

### 文本样式

```markdown
**粗体文本** _斜体文本_ `行内代码` ~~删除线~~
```

### 列表

```markdown
- 无序列表项1
- 无序列表项2
  - 嵌套列表项

1. 有序列表项1
2. 有序列表项2
   1. 嵌套有序列表
```

### 链接和图片

```markdown
[链接文本](https://example.com) ![图片描述](https://example.com/image.jpg)
```

### 代码块

```markdown
\`\`\`javascript function example() { return 'Hello World'; } \`\`\`
```

### 表格

```markdown
| 列1   | 列2   | 列3   |
| ----- | ----- | ----- |
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
```

### 引用

```markdown
> 这是一个引用块支持多行引用
```

### 数学公式

```markdown
行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
```

### 分隔线

```markdown
---
```

## 高级特性

### 数学公式渲染

组件集成了 MathJax 支持，可以渲染复杂的数学公式：

```markdown
- 行内公式：$\\alpha + \\beta = \\gamma$
- 分数：$\\frac{a}{b}$
- 积分：$\\int_0^1 x^2 dx$
- 矩阵：$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$
```

### 代码高亮

集成了自定义 Highlighter 组件，支持 100 + 编程语言的语法高亮：

```markdown
\`\`\`python def fibonacci(n): if n <= 1: return n return fibonacci(n-1) + fibonacci(n-2) \`\`\`
```

### 图片处理

- 自动计算图片比例
- 响应式宽度适配
- 支持网络图片和本地图片
- 自动边框和圆角样式

### 视频支持

组件支持视频内容的渲染（通过 Expo AV）：

```markdown
[视频](https://example.com/video.mp4)
```

## 性能优化

### 图片缓存

- 自动缓存图片尺寸信息
- 避免重复计算图片高度

### 样式缓存

- 样式对象使用 StyleSheet.create 创建
- 根据主题和配置动态生成样式

### 内存管理

- 组件卸载时自动清理缓存
- 合理的图片加载策略

## 故障排除

### 常见问题

1. **数学公式不显示**
   - 确保安装了`react-native-mathjax-html-to-svg`
   - 检查 MathJax 语法是否正确

2. **代码高亮不工作**
   - 确保 Highlighter 组件正确导入
   - 检查语言标识是否支持

3. **图片不显示**
   - 检查图片 URL 是否有效
   - 确保网络权限配置正确

4. **样式异常**
   - 检查主题配置是否正确
   - 确认传入的样式参数范围

### 调试建议

1. 使用 React DevTools 查看组件状态
2. 检查 console 警告信息
3. 验证 Markdown 语法正确性
4. 测试不同主题下的显示效果

## 最佳实践

1. **内容优化**
   - 避免过长的 Markdown 内容
   - 使用合适的图片尺寸
   - 控制数学公式复杂度

2. **性能优化**
   - 合理设置字体大小和行高
   - 避免频繁更新 content props
   - 使用 memo 优化重渲染

3. **样式配置**
   - 根据设备屏幕调整 fontSize
   - 保持一致的 marginMultiple
   - 适配不同主题的色彩方案

4. **用户体验**
   - 提供加载状态指示
   - 处理网络图片加载失败
   - 支持手势缩放和滚动

## 示例代码

查看`demos/`目录下的完整示例：

- `basic.tsx` - 基础用法示例
- `advanced.tsx` - 高级特性示例
- `math.tsx` - 数学公式示例
- `styling.tsx` - 样式配置示例
