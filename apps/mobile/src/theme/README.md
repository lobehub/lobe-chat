# React Native 主题系统

这是一个参考 Ant Design 主题系统设计的完整主题解决方案，提供了灵活、可扩展的主题管理能力。

## 🏗️ 架构设计

主题系统采用三层架构：

```
SeedToken (种子Token) → MapToken (映射Token) → AliasToken (别名Token)
```

### 1. SeedToken (种子 Token)

基础设计 Token，包含最核心的设计决策：

- 品牌色、功能色
- 字体、尺寸、圆角等基础参数
- 动画、透明度等全局设置

### 2. MapToken (映射 Token)

从 SeedToken 通过算法派生的中间层 Token：

- 颜色梯度（1-10 级）
- 尺寸梯度（XXS-XXL）
- 字体、行高、阴影等

### 3. AliasToken (别名 Token)

最终给开发者使用的 Token，具有语义化命名：

- `colorText`、`colorBgContainer`
- `padding`、`margin`、`borderRadius`

## 🎨 主要特性

- ✨ **透明主色支持**：支持 `rgba(0,0,0,0)` 作为主色
- 🌗 **亮色 / 暗色模式**：自动适配系统主题
- 📱 **React Native 优化**：专为移动端设计
- 🎯 **类型安全**：完整的 TypeScript 支持
- 🔧 **算法可扩展**：支持自定义主题算法
- 💾 **持久化存储**：自动保存用户主题偏好

## 📦 快速开始

### 1. 基础使用

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ThemeProvider, useThemeToken } from '@/theme';

// 在应用根部包裹 ThemeProvider
const App = () => (
  <ThemeProvider>
    <MyComponent />
  </ThemeProvider>
);

// 在组件中使用主题
const MyComponent = () => {
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
};
```

### 2. 自定义主题配置

```tsx
import React from 'react';
import { ThemeProvider, darkAlgorithm } from '@/theme';

// 使用自定义 token
const AppWithCustomTheme = () => (
  <ThemeProvider
    theme={{
      token: {
        // Seed Token，影响范围大
        colorPrimary: '#00b96b',
        borderRadius: 2,

        // 派生变量，影响范围小
        colorBgContainer: '#f6ffed',
      },
    }}
  >
    <MyApp />
  </ThemeProvider>
);

// 使用自定义算法
const AppWithDarkTheme = () => (
  <ThemeProvider
    theme={{
      algorithm: darkAlgorithm,
    }}
  >
    <MyApp />
  </ThemeProvider>
);

// 同时使用自定义 token 和算法
const AppWithCustomThemeAndAlgorithm = () => (
  <ThemeProvider
    theme={{
      token: {
        colorPrimary: '#00b96b',
        borderRadius: 2,
        colorBgContainer: '#f6ffed',
      },
      algorithm: darkAlgorithm,
    }}
  >
    <MyApp />
  </ThemeProvider>
);
```

### 3. 主题切换

```tsx
import { useTheme } from '@/theme';

const ThemeToggle = () => {
  const { theme, toggleTheme, setThemeMode } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>当前模式: {theme.mode}</Text>
    </TouchableOpacity>
  );
};
```

## 🛠️ 自定义主题

### 1. 自定义品牌色

```tsx
import { generateDesignToken } from '@/theme';

const customTheme = generateDesignToken({
  token: {
    colorPrimary: 'rgba(0, 0, 0, 0)', // 透明主色
    colorSuccess: '#00B96B',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
  },
});
```

### 2. 自定义算法

```tsx
import { darkAlgorithm, compactAlgorithm } from '@/theme';

// 使用暗色模式
const darkTheme = generateDesignToken({
  algorithm: darkAlgorithm,
  token: { colorPrimary: 'rgba(0, 0, 0, 0)' },
});

// 使用紧凑模式
const compactTheme = generateDesignToken({
  algorithm: compactAlgorithm,
  token: { colorPrimary: 'rgba(0, 0, 0, 0)' },
});

// 组合多个算法
const multiTheme = generateDesignToken({
  algorithm: [darkAlgorithm, compactAlgorithm],
  token: { colorPrimary: 'rgba(0, 0, 0, 0)' },
});
```

### 3. 自定义种子 Token

```tsx
const customSeedTheme = generateDesignToken({
  token: {
    // 基础设计
    colorPrimary: 'rgba(0, 0, 0, 0)',
    fontSize: 16,
    borderRadius: 8,
    controlHeight: 36,

    // 间距系统
    sizeUnit: 4,
    sizeStep: 4,

    // 字体系统
    fontFamily: 'SF Pro Text',

    // 动画系统
    motionUnit: 0.1,
    motionBase: 0,
    motion: true,
  },
});
```

## 🎯 内置算法

- **defaultAlgorithm**: 默认亮色算法
- **darkAlgorithm**: 暗色模式算法
- **compactAlgorithm**: 紧凑布局算法
- **compactDarkAlgorithm**: 紧凑暗色算法

## 📚 Token 参考

### 颜色系统

```tsx
// 品牌色
token.colorPrimary;
token.colorPrimaryHover;
token.colorPrimaryActive;
token.colorPrimaryBg;

// 功能色
token.colorSuccess;
token.colorWarning;
token.colorError;
token.colorInfo;

// 中性色
token.colorText;
token.colorTextSecondary;
token.colorBgContainer;
token.colorBorder;
```

### 尺寸系统

```tsx
// 间距
token.marginXS; // 4
token.marginSM; // 8
token.margin; // 16
token.marginLG; // 24

// 内边距
token.paddingSM;
token.padding;
token.paddingLG;

// 圆角
token.borderRadius;
token.borderRadiusLG;
token.borderRadiusSM;
```

### 字体系统

```tsx
// 字号
token.fontSizeSM; // 12
token.fontSize; // 14
token.fontSizeLG; // 16
token.fontSizeXL; // 20

// 标题字号
token.fontSizeHeading1; // 38
token.fontSizeHeading2; // 30

// 行高
token.lineHeight;
token.lineHeightLG;
```

## 🔧 工具函数

主题系统提供了丰富的颜色处理工具：

```tsx
import {
  parseColor,
  getAlphaColor,
  adjustBrightness,
  mixColor,
  generateColorPalette,
} from '@/theme';

// 解析颜色
const { r, g, b, a } = parseColor('#1677ff');

// 设置透明度
const alphaColor = getAlphaColor('#1677ff', 0.5);

// 调整亮度
const brighterColor = adjustBrightness('#1677ff', 0.1);

// 颜色混合
const mixedColor = mixColor('#1677ff', '#ffffff', 0.5);

// 生成颜色梯度
const palette = generateColorPalette('#1677ff');
```

## 🎨 最佳实践

1. **使用语义化 Token**：优先使用 `colorText` 而不是具体颜色值
2. **响应主题变化**：使用 `useThemeToken` Hook 确保组件响应主题切换
3. **保持一致性**：在整个应用中使用统一的间距和字体 Token
4. **自定义适度**：避免过度自定义，保持设计系统的一致性

## 📖 更多示例

查看 [examples.ts](./examples.ts) 文件获取更多使用示例。
