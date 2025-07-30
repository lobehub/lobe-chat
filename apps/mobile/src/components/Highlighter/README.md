# Highlighter 组件

基于 Shiki 的高性能代码高亮组件，为 React Native 应用提供丰富的语法高亮功能。

## 功能特性

- ✅ 支持 100+ 种编程语言
- ✅ 多种主题支持
- ✅ 代码复制功能
- ✅ 语言动态切换
- ✅ 文件名显示
- ✅ 展开 / 收起功能
- ✅ 紧凑型和默认型显示
- ✅ 自定义样式支持
- ✅ TypeScript 支持
- ✅ 高性能渲染

## 快速开始

```tsx
import Highlighter from '@/components/Highlighter';

// 基础用法
<Highlighter code="console.log('Hello World');" lang="javascript" />;
```

## API

### HighlighterProps

| 属性                | 类型                     | 默认值       | 说明                     |
| ------------------- | ------------------------ | ------------ | ------------------------ |
| code                | `string`                 | -            | 要高亮的代码内容         |
| lang                | `string`                 | `'markdown'` | 代码语言                 |
| fullFeatured        | `boolean`                | `false`      | 是否启用完整功能模式     |
| copyable            | `boolean`                | `true`       | 是否显示复制按钮         |
| showLanguage        | `boolean`                | `true`       | 是否显示语言标识         |
| fileName            | `string`                 | -            | 文件名（会覆盖语言标识） |
| defalutExpand       | `boolean`                | `true`       | 默认是否展开             |
| type                | `'default' \| 'compact'` | `'default'`  | 显示类型                 |
| allowChangeLanguage | `boolean`                | `false`      | 是否允许切换语言         |
| style               | `StyleProp<ViewStyle>`   | -            | 自定义容器样式           |

### 支持的语言

组件支持 100+ 种编程语言，包括但不限于：

**前端语言**

- JavaScript / TypeScript
- HTML / CSS / SCSS / Less
- JSX / TSX
- Vue / Angular

**后端语言**

- Python / Java / C# / Go
- PHP / Ruby / Rust / Swift
- C / C++ / Kotlin / Scala

**配置文件**

- JSON / YAML / TOML / XML
- Dockerfile / Docker Compose
- Nginx / Apache

**数据库**

- SQL / MySQL / PostgreSQL
- MongoDB / Redis

**其他**

- Shell / Bash / PowerShell
- Markdown / LaTeX
- GraphQL / Protocol Buffers

## 使用示例

### 1. 基础代码高亮

```tsx
<Highlighter
  code={`function hello() {
  console.log('Hello World!');
}`}
  lang="javascript"
/>
```

### 2. 完整功能模式

```tsx
<Highlighter
  code={codeContent}
  lang="typescript"
  fullFeatured
  fileName="example.ts"
  copyable
  showLanguage
/>
```

### 3. 紧凑型显示

```tsx
<Highlighter code="npm install react-native" lang="bash" fullFeatured type="compact" />
```

### 4. 可切换语言

```tsx
<Highlighter code={codeContent} lang="javascript" fullFeatured allowChangeLanguage />
```

### 5. 自定义样式

```tsx
<Highlighter
  code={codeContent}
  lang="css"
  style={{
    borderRadius: 12,
    margin: 16,
  }}
/>
```

### 6. 默认收起状态

```tsx
<Highlighter code={longCodeContent} lang="python" fullFeatured defalutExpand={false} />
```

## 功能模式对比

### 基础模式 (`fullFeatured={false}`)

- 纯代码高亮显示
- 轻量级渲染
- 适合简单的代码片段展示
- 无交互功能

### 完整功能模式 (`fullFeatured={true}`)

- 包含头部工具栏
- 支持代码复制
- 支持展开 / 收起
- 支持语言切换
- 支持文件名显示
- 适合完整的代码文档展示

## 主题系统

组件使用 Nord 主题作为默认主题，提供暗色调的专业代码高亮效果：

- **背景色**: 深色系 (`#2E3440`)
- **文本色**: 浅色系 (`#D8DEE9`)
- **关键字**: 蓝色系 (`#81A1C1`)
- **字符串**: 绿色系 (`#A3BE8C`)
- **注释**: 灰色系 (`#616E88`)

## 性能优化

### Token 缓存

- 自动缓存语法分析结果
- 避免重复解析相同代码
- 提升大文件渲染性能

### 懒加载

- 按需加载语言定义
- 减少初始包体积
- 提升应用启动速度

### 内存管理

- 自动清理未使用的语言定义
- 优化 Token 对象结构
- 防止内存泄漏

## 高级用法

### 1. 自定义语言映射

```tsx
// 对于不常见的文件扩展名，可以手动指定语言
<Highlighter
  code={content}
  lang="javascript" // 手动指定为 JavaScript
  fileName="config.mjs" // 显示原始文件名
/>
```

### 2. 长代码处理

```tsx
// 对于很长的代码，建议默认收起
<Highlighter
  code={veryLongCode}
  lang="python"
  fullFeatured
  defalutExpand={false}
  fileName="long_script.py"
/>
```

### 3. 代码片段展示

```tsx
// 对于短代码片段，使用紧凑模式
<Highlighter
  code="import React from 'react'"
  lang="javascript"
  fullFeatured
  type="compact"
  copyable={false}
/>
```

## 注意事项

### 1. 语言识别

- 组件会自动处理大小写问题
- 不支持的语言会降级为 markdown 模式
- 建议使用标准的语言标识符

### 2. 性能考虑

- 大文件（>10KB）建议使用默认收起模式
- 避免在列表中渲染大量高亮组件
- 考虑使用虚拟化来处理大量代码块

### 3. 样式冲突

- 自定义样式可能会影响高亮效果
- 建议只修改容器相关样式
- 避免修改内部文本样式

### 4. 复制功能

- 需要 `expo-clipboard` 权限
- 在模拟器中可能无法正常工作
- 建议在真机上测试复制功能

## 最佳实践

### 1. 选择合适的模式

```tsx
// 文档展示：使用完整功能模式
<Highlighter fullFeatured fileName="example.js" />

// 内联代码：使用基础模式
<Highlighter code="const x = 1" lang="js" />

// 命令行：使用紧凑模式
<Highlighter type="compact" lang="bash" />
```

### 2. 优化用户体验

```tsx
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
```

### 3. 合理使用复制功能

```tsx
// 教程代码：启用复制
<Highlighter copyable />

// 示例展示：禁用复制
<Highlighter copyable={false} />
```

## 依赖

- `@shikijs/core` - 语法高亮引擎
- `expo-clipboard` - 剪贴板功能
- `@expo/vector-icons` - 图标支持
- `react-native` - 基础框架

## 更新日志

### v1.0.0

- 初始版本发布
- 支持基础和完整功能模式
- 100+ 语言支持
- Nord 主题集成

### v1.1.0

- 添加紧凑型显示模式
- 优化长代码渲染性能
- 改进语言自动识别

### v1.2.0

- 添加语言动态切换功能
- 优化复制交互体验
- 修复内存泄漏问题

## 故障排除

### 1. 代码不高亮

- 检查语言标识符是否正确
- 确认代码格式是否有效
- 查看控制台是否有错误信息

### 2. 复制功能失效

- 确认设备支持剪贴板操作
- 检查 expo-clipboard 权限
- 在真机上测试功能

### 3. 性能问题

- 减少同时渲染的代码块数量
- 使用默认收起模式
- 考虑代码分页或虚拟化

### 4. 样式异常

- 检查自定义样式是否冲突
- 确认主题配置是否正确
- 重置为默认样式测试
