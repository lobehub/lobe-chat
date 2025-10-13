---
group: Theme
title: ThemeProvider
description: React Native theme provider component based on Ant Design theme system, supporting fully customizable theme configuration.
---

## Features

- 🎨 **Flexible Configuration** - Supports custom tokens and algorithms
- 🌗 **Auto Adaptation** - Automatically adapts to light/dark mode
- 🔧 **Algorithm Composition** - Supports combining multiple theme algorithms
- 📱 **Mobile Optimized** - Optimized specifically for React Native
- 🎯 **Type Safe** - Complete TypeScript support

## Basic Usage

```tsx
import { ThemeProvider } from '@lobehub/ui-rn';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Custom Configuration

### Custom Token

```tsx
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
```

### Custom Algorithm

```tsx
import { darkAlgorithm } from '@lobehub/ui-rn';

<ThemeProvider
  theme={{
    algorithm: darkAlgorithm,
  }}
>
  <YourApp />
</ThemeProvider>;
```

### Combined Configuration

```tsx
import { compactAlgorithm, darkAlgorithm } from '@lobehub/ui-rn';

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
```

## Using Theme

### useTheme Hook

```tsx
import { useThemeToken } from '@lobehub/ui-rn';

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
```

### useThemeMode Hook

```tsx
import { useTheme } from '@lobehub/ui-rn';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>Current mode: {theme.mode}</Text>
    </TouchableOpacity>
  );
}
```

## Available Algorithms

- `defaultAlgorithm` - Default light algorithm
- `darkAlgorithm` - Dark algorithm
- `compactAlgorithm` - Compact algorithm (smaller spacing)
- `compactDarkAlgorithm` - Compact dark algorithm
