---
group: Feedback
title: Toast
description: Elegant React Native Toast notification component supporting multiple message types and animation effects.
---

## Features

- ✅ **Multiple Types** - Supports success, error, warning, info, loading types
- ✅ **Smooth Animations** - Spring-based animations with scale, translateY, and opacity effects
- ✅ **Stack Effect** - Multiple toasts automatically stack with scale and offset animations
- ✅ **Position Control** - Support for top and bottom positions
- ✅ **Auto Dismiss** - Configurable auto-hide duration
- ✅ **Manual Close** - Supports click-to-close and manual control
- ✅ **Safe Area** - Auto-adapts to safe area, avoids status bar blocking
- ✅ **Multi-instance Management** - Supports displaying multiple Toasts simultaneously
- ✅ **Reanimated 2** - Powered by react-native-reanimated for smooth 60fps animations
- ✅ **Dark Theme** - Modern dark design style
- ✅ **TypeScript** - Complete TypeScript type support
- ✅ **Context API** - React Context-based state management
- ✅ **Convenient API** - Simple and easy-to-use call interface

## Basic Usage

### 1. Setup ToastProvider

```jsx
import { ToastProvider } from '@lobehub/ui-rn';

export default function App() {
  return (
    <ToastProvider>
      {/* Your app content */}
      <YourAppContent />
    </ToastProvider>
  );
}
```

### 2. Use useToast Hook

```jsx
import { useToast } from '@lobehub/ui-rn';

export default function MyComponent() {
  const toast = useToast();

  const showSuccess = () => {
    toast.success('Operation successful!');
  };

  const showError = () => {
    toast.error('Operation failed, please retry');
  };

  const showWarning = () => {
    toast.warning('Warning: This action cannot be undone');
  };

  const showWithPosition = () => {
    toast.show({
      message: 'Bottom position',
      type: 'info',
      position: 'bottom',
      duration: 3000,
    });
  };

  return (
    <View>
      <Button title="Success Message" onPress={showSuccess} />
      <Button title="Error Message" onPress={showError} />
      <Button title="Warning Message" onPress={showWarning} />
      <Button title="Bottom Position" onPress={showWithPosition} />
    </View>
  );
}
```

### 3. API Methods

```tsx
// Show different types of toasts
toast.success(message, duration?, onClose?)
toast.error(message, duration?, onClose?)
toast.warning(message, duration?, onClose?)
toast.info(message, duration?, onClose?)
toast.loading(message, duration?, onClose?)

// Show with custom configuration
toast.show({
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' | 'loading',
  position?: 'top' | 'bottom', // default: 'top'
  duration?: number, // default: 3000ms, 0 for no auto dismiss
  onClose?: () => void,
})

// Manual control
toast.hide(id) // Hide specific toast
```

## Use Cases

1. **Success Feedback**: Confirmation prompt after successful operation
2. **Error Message**: Warning for operation failure or exception
3. **Info Notification**: Reminder for important information
4. **Loading State**: Progress prompt for long-running operations

For more detailed information, please check the complete README documentation.
