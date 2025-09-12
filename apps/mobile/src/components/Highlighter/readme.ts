const HIGHLIGHTER_README = `# Highlighter 组件

基于 Shiki 的高性能代码高亮组件，为 React Native 应用提供丰富的语法高亮功能。

## 功能特性

- ✅ 支持 100+ 种编程语言
- ✅ 多种主题支持
- ✅ 代码复制功能
- ✅ 语言动态切换
- ✅ 文件名显示
- ✅ 展开/收起功能
- ✅ 紧凑型和默认型显示
- ✅ 自定义样式支持
- ✅ TypeScript 支持
- ✅ 高性能渲染

## 快速开始

\`\`\`tsx
import Highlighter from '@/components/Highlighter';

// 基础用法
<Highlighter 
  code="console.log('Hello World');" 
  lang="javascript" 
/>
\`\`\`

## API

### HighlighterProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| code | \`string\` | - | 要高亮的代码内容 |
| lang | \`string\` | \`'markdown'\` | 代码语言 |
| fullFeatured | \`boolean\` | \`false\` | 是否启用完整功能模式 |
| copyable | \`boolean\` | \`true\` | 是否显示复制按钮 |
| showLanguage | \`boolean\` | \`true\` | 是否显示语言标识 |
| fileName | \`string\` | - | 文件名（会覆盖语言标识） |
| defalutExpand | \`boolean\` | \`true\` | 默认是否展开 |
| type | \`'default' \\| 'compact'\` | \`'default'\` | 显示类型 |
| allowChangeLanguage | \`boolean\` | \`false\` | 是否允许切换语言 |
| style | \`StyleProp<ViewStyle>\` | - | 自定义容器样式 |

## 功能模式对比

### 基础模式 (\`fullFeatured={false}\`)

- 纯代码高亮显示
- 轻量级渲染
- 适合简单的代码片段展示
- 无交互功能

### 完整功能模式 (\`fullFeatured={true}\`)

- 包含头部工具栏
- 支持代码复制
- 支持展开/收起
- 支持语言切换
- 支持文件名显示
- 适合完整的代码文档展示

## 性能优化

- **Token 缓存**: 自动缓存语法分析结果
- **懒加载**: 按需加载语言定义
- **内存管理**: 自动清理未使用的语言定义

## 最佳实践

### 1. 选择合适的模式
\`\`\`tsx
// 文档展示：使用完整功能模式
<Highlighter fullFeatured fileName="example.js" />

// 内联代码：使用基础模式
<Highlighter code="const x = 1" lang="js" />

// 命令行：使用紧凑模式
<Highlighter type="compact" lang="bash" />
\`\`\`

### 2. 优化用户体验
\`\`\`tsx
// 长代码默认收起，让用户主动展开
<Highlighter 
  defalutExpand={false}
  fullFeatured
  fileName="长文件名.js"
/>

// 提供语言切换，方便调试
<Highlighter 
  allowChangeLanguage 
  fullFeatured
/>
\`\`\``;

export default HIGHLIGHTER_README;
