const README = `# ThemeProvider

基于 Ant Design 主题系统设计的 React Native 主题提供者组件，支持完全自定义的主题配置。

## 特性

- 🎨 **灵活配置** - 支持自定义 token 和 algorithm
- 🌗 **自动适配** - 自动适配亮色 / 暗色模式
- 🔧 **算法组合** - 支持多个主题算法组合使用
- 📱 **移动优化** - 专为 React Native 优化
- 🎯 **类型安全** - 完整的 TypeScript 支持

## 基础用法

\`\`\`tsx
import { ThemeProvider } from '@/components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
\`\`\`

## 自定义配置

### 自定义 Token

\`\`\`tsx
<ThemeProvider
  theme={{
    token: {
      colorPrimary: '#00b96b',
      borderRadius: 2,
    },
  }}
>
  <YourApp />
</ThemeProvider>
\`\`\`

### 自定义算法

\`\`\`tsx
import { darkAlgorithm } from '@/components/ThemeProvider';

<ThemeProvider
  theme={{
    algorithm: darkAlgorithm,
  }}
>
  <YourApp />
</ThemeProvider>;
\`\`\`

### 组合配置

\`\`\`tsx
import { darkAlgorithm, compactAlgorithm } from '@/components/ThemeProvider';

<ThemeProvider
  theme={{
    token: {
      colorPrimary: '#ff6b35',
      borderRadius: 2,
    },
    algorithm: [darkAlgorithm, compactAlgorithm],
  }}
>
  <YourApp />
</ThemeProvider>;
\`\`\`

## 使用主题

### useThemeToken Hook

\`\`\`tsx
import { useThemeToken } from '@/components/ThemeProvider';

function MyComponent() {
  const token = useThemeToken();

  return (
    <View
      style={{
        backgroundColor: token.colorBgContainer,
        padding: token.padding,
        borderRadius: token.borderRadius,
      }}
    >
      <Text
        style={{
          color: token.colorText,
          fontSize: token.fontSize,
        }}
      >
        Hello Theme!
      </Text>
    </View>
  );
}
\`\`\`

### useTheme Hook

\`\`\`tsx
import { useTheme } from '@/components/ThemeProvider';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>当前模式: {theme.mode}</Text>
    </TouchableOpacity>
  );
}
\`\`\`

## 可用算法

- \`defaultAlgorithm\` - 默认亮色算法
- \`darkAlgorithm\` - 暗色算法
- \`compactAlgorithm\` - 紧凑算法（较小间距）
- \`compactDarkAlgorithm\` - 紧凑暗色算法

## API

### ThemeProvider Props

| 属性     | 类型        | 默认值 | 说明     |
| -------- | ----------- | ------ | -------- |
| children | ReactNode   | -      | 子组件   |
| theme    | ThemeConfig | -      | 主题配置 |

### ThemeConfig

| 属性      | 类型                                    | 说明            |
| --------- | --------------------------------------- | --------------- |
| token     | Partial<SeedToken>                      | 种子 Token 配置 |
| algorithm | MappingAlgorithm \\| MappingAlgorithm\\[] | 主题算法        |
`;

export default README;
