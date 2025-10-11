const INPUT_README = `# Input组件

一个增强的React Native文本输入组件，支持前缀、后缀和复合组件。

## 特性

- ✅ **前缀支持** - 支持添加前缀图标或文本
- ✅ **后缀支持** - 支持添加后缀图标或按钮
- ✅ **复合组件** - 提供Search和Password专用组件
- ✅ **统一样式** - 基于设计系统的一致性样式
- ✅ **灵活布局** - 使用View包装实现灵活布局
- ✅ **TypeScript** - 完整的TypeScript类型支持
- ✅ **主题适配** - 自动适配明暗主题
- ✅ **平台优化** - 针对Android和iOS的样式优化
- ✅ **文本域支持** - 提供支持 autoSize 的 TextArea 多行输入

## 基本用法

### 1. 基础输入框

\`\`\`jsx
import { Input } from '@lobehub/ui-rn';

<Input placeholder="请输入内容" />
<Input defaultValue="预设值" />
\`\`\`

### 2. 带前缀的输入框

\`\`\`jsx
import { Text } from 'react-native';

<Input
  placeholder="请输入用户名"
  prefix={<Text>@</Text>}
/>
\`\`\`

### 3. 带后缀的输入框

\`\`\`jsx
import { TouchableOpacity } from 'react-native';

<Input
  placeholder="输入邮箱前缀"
  suffix={<Text>@gmail.com</Text>}
/>

<Input
  placeholder="输入消息"
  suffix={<TouchableOpacity><SendIcon /></TouchableOpacity>}
/>
\`\`\`

### 4. 复合组件

\`\`\`jsx
// 搜索输入框
<Input.Search placeholder="搜索内容..." />

// 密码输入框（自动切换显示/隐藏）
<Input.Password placeholder="请输入密码" />
\`\`\`

### 5. 外观变体

\`\`\`jsx
// 默认（filled）
<Input placeholder="请输入内容" />

// 无底色（borderless）
<Input variant="borderless" placeholder="请输入内容" />
<Input.Search variant="borderless" placeholder="搜索内容..." />
<Input.Password variant="borderless" placeholder="请输入密码" />

// 描边（outlined）
<Input variant="outlined" placeholder="请输入内容" />
<Input.Search variant="outlined" placeholder="搜索内容..." />
<Input.Password variant="outlined" placeholder="请输入密码" />
\`\`\`

### 6. 尺寸大小

\`\`\`jsx
// 小号
<Input size="small" placeholder="Small" />
<Input.Search size="small" placeholder="Small Search" />
<Input.Password size="small" placeholder="Small Password" />

// 中号（默认）
<Input size="middle" placeholder="Middle" />
<Input.Search size="middle" placeholder="Middle Search" />
<Input.Password size="middle" placeholder="Middle Password" />

// 大号
<Input size="large" placeholder="Large" />
<Input.Search size="large" placeholder="Large Search" />
<Input.Password size="large" placeholder="Large Password" />
\`\`\`

### 7. 自定义样式

\`\`\`jsx
<Input
  placeholder="自定义样式"
  style={{ backgroundColor: 'red' }}
/>
\`\`\`

### 8. 多行文本输入

\`\`\`jsx
<Input.TextArea autoSize placeholder="请输入详细描述" />

<Input.TextArea
  autoSize={{ minRows: 2, maxRows: 6 }}
  placeholder="支持 autoSize 范围配置"
  variant="outlined"
/>

<Input.TextArea
  autoSize
  placeholder="支持内容样式定制"
  style={{ backgroundColor: '#F7F8FA' }}
/>
\`\`\`

## API参考

### InputProps

| 属性 | 类型 | 描述 |
|------|------|------|
| \`variant\` | \`'filled' | 'borderless' | 'outlined'\` | 外观变体（默认 filled） |
| \`size\` | \`'large' | 'middle' | 'small'\` | 尺寸大小（默认 middle） |
| \`prefix\` | \`React.ReactNode\` | 前缀内容 |
| \`suffix\` | \`React.ReactNode\` | 后缀内容 |
| \`style\` | \`StyleProp<ViewStyle>\` | 外层容器样式 |
| ...其他 | \`RNTextInputProps\` | React Native TextInput 的所有属性（不包含 multiline） |

### TextAreaProps

| 属性 | 类型 | 描述 |
|------|------|------|
| \`autoSize\` | \`boolean | { minRows?: number; maxRows?: number }\` | 控制高度自适应行为 |
| \`style\` | \`StyleProp<ViewStyle>\` | 外层容器样式 |
| \`variant\` | \`'filled' | 'borderless' | 'outlined'\` | 外观变体（默认 filled） |
| ...其他 | \`RNTextInputProps\` | React Native TextInput 的所有属性（默认启用 multiline） |

### 复合组件

#### Input.Search
搜索输入框，自动添加搜索图标前缀，returnKeyType设为search

#### Input.Password
密码输入框，自动添加眼睛图标后缀，支持切换显示/隐藏密码

#### Input.TextArea
多行文本输入框，默认开启 \`multiline\`，适合长文本场景

## 设计原则

- **一致性**：统一的外观和交互体验
- **灵活性**：支持各种自定义需求
- **易用性**：简单直观的API设计`;

export default INPUT_README;
