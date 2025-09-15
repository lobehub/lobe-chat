const MARKDOWN_README = `# Markdown组件

一个功能强大的React Native Markdown渲染组件，支持数学公式、代码高亮、图片、视频等多种内容类型。

## 特性

- ✅ **数学公式渲染** - 支持MathJax数学公式显示
- ✅ **代码高亮** - 集成自定义Highlighter组件
- ✅ **图片自适应** - 自动计算图片高度，响应式显示
- ✅ **视频支持** - 支持视频内容渲染
- ✅ **表格支持** - 完整的表格样式和布局
- ✅ **深色主题** - 自动适配暗色/亮色主题
- ✅ **自定义样式** - 丰富的样式配置选项
- ✅ **链接支持** - 可点击链接和自动跳转
- ✅ **列表支持** - 有序列表和无序列表
- ✅ **引用块** - 支持blockquote样式

## 基本用法

\`\`\`jsx
import MarkdownRender from '@/components/Markdown';

export default function App() {
  const markdownContent = \`
# 标题示例

这是一个**粗体文本**和*斜体文本*示例。

## 代码示例

\\\`\\\`\\\`javascript
function hello() {
  console.log('Hello World!');
}
\\\`\\\`\\\`

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$\\\\int_{-\\\\infty}^{\\\\infty} e^{-x^2} dx = \\\\sqrt{\\\\pi}$$
  \`;

  return (
    <MarkdownRender content={markdownContent} />
  );
}
\`\`\`

## API参考

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| \`content\` | \`string\` | - | **必需** - 要渲染的Markdown内容 |
| \`fontSize\` | \`number\` | \`16\` | 基础字体大小（px） |
| \`headerMultiple\` | \`number\` | \`1\` | 标题字体大小倍数 |
| \`marginMultiple\` | \`number\` | \`1.5\` | 边距倍数 |
| \`lineHeight\` | \`number\` | \`1.8\` | 行高倍数 |

## 支持的功能

### 数学公式渲染
基于MathJax引擎，支持复杂的数学表达式：
- 行内公式：\`$E = mc^2$\`
- 块级公式：\`$$\\\\int_0^1 x^2 dx$$\`

### 代码高亮
集成Highlighter组件，支持100+编程语言的语法高亮。

### 图片和视频
- 自动计算图片尺寸
- 响应式适配
- 支持视频内容

### 表格支持
完整的表格渲染和样式支持，包括边框、对齐等。

更多详细信息请查看完整的README文档。`;

export default MARKDOWN_README;
