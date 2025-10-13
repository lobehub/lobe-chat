---
group: Form
title: Input
description: Enhanced React Native text input component with prefix, suffix, and compound component support.
---

## Features

- ✅ **Prefix Support** - Supports adding prefix icons or text
- ✅ **Suffix Support** - Supports adding suffix icons or buttons
- ✅ **Compound Components** - Provides dedicated Search and Password components
- ✅ **Unified Styles** - Consistent design system-based styling
- ✅ **Flexible Layout** - Flexible layout using View wrapper
- ✅ **TypeScript** - Complete TypeScript type support
- ✅ **Theme Adaptation** - Automatic light/dark theme adaptation
- ✅ **Platform Optimization** - Style optimization for Android and iOS
- ✅ **TextArea Support** - Provides multi-line input with autoSize support

## Basic Usage

### 1. Basic Input

```jsx
import { Input } from '@lobehub/ui-rn';

<Input placeholder="Enter content" />
<Input defaultValue="Preset value" />
```

### 2. Input with Prefix

```jsx
import { Text } from 'react-native';

<Input placeholder="Enter username" prefix={<Text>@</Text>} />;
```

### 3. Input with Suffix

```jsx
import { TouchableOpacity } from 'react-native';

<Input
  placeholder="Enter email prefix"
  suffix={<Text>@gmail.com</Text>}
/>

<Input
  placeholder="Enter message"
  suffix={<TouchableOpacity><SendIcon /></TouchableOpacity>}
/>
```

### 4. Compound Components

```jsx
// Search input
<Input.Search placeholder="Search..." />

// Password input (auto toggle show/hide)
<Input.Password placeholder="Enter password" />
```

### 5. Appearance Variants

```jsx
// Default (filled)
<Input placeholder="Enter content" />

// Borderless
<Input variant="borderless" placeholder="Enter content" />
<Input.Search variant="borderless" placeholder="Search..." />
<Input.Password variant="borderless" placeholder="Enter password" />

// Outlined
<Input variant="outlined" placeholder="Enter content" />
<Input.Search variant="outlined" placeholder="Search..." />
<Input.Password variant="outlined" placeholder="Enter password" />
```

### 6. Sizes

```jsx
// Small
<Input size="small" placeholder="Small" />
<Input.Search size="small" placeholder="Small Search" />
<Input.Password size="small" placeholder="Small Password" />

// Middle (default)
<Input size="middle" placeholder="Middle" />
<Input.Search size="middle" placeholder="Middle Search" />
<Input.Password size="middle" placeholder="Middle Password" />

// Large
<Input size="large" placeholder="Large" />
<Input.Search size="large" placeholder="Large Search" />
<Input.Password size="large" placeholder="Large Password" />
```

### 7. Custom Styles

```jsx
<Input placeholder="Custom style" style={{ backgroundColor: 'red' }} />
```

### 8. Multi-line Text Input

```jsx
<Input.TextArea autoSize placeholder="Enter detailed description" />

<Input.TextArea
  autoSize={{ minRows: 2, maxRows: 6 }}
  placeholder="Supports autoSize range configuration"
  variant="outlined"
/>

<Input.TextArea
  autoSize
  placeholder="Supports content style customization"
  style={{ backgroundColor: '#F7F8FA' }}
/>
```

## Compound Components

### Input.Search

Search input with automatic search icon prefix and returnKeyType set to search.

### Input.Password

Password input with automatic eye icon suffix, supports toggling show/hide password.

### Input.TextArea

Multi-line text input, `multiline` enabled by default, suitable for long text scenarios.

## Design Principles

- **Consistency**: Unified appearance and interaction experience
- **Flexibility**: Supports various customization needs
- **Ease of Use**: Simple and intuitive API design
