---
group: Feedback
title: Toast
description: Elegant React Native Toast notification component supporting multiple message types and animation effects.
---

## Features

- ✅ **Multiple Types** - Supports success, error, info, loading types
- ✅ **Elegant Animation** - Smooth slide-in and slide-out animation effects
- ✅ **Auto Dismiss** - Configurable auto-hide duration
- ✅ **Manual Close** - Supports click-to-close and manual control
- ✅ **Safe Area** - Auto-adapts to safe area, avoids status bar blocking
- ✅ **Multi-instance Management** - Supports displaying multiple Toasts simultaneously
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

  return (
    <View>
      <Button title="Success Message" onPress={showSuccess} />
      <Button title="Error Message" onPress={showError} />
    </View>
  );
}
```

## Use Cases

1. **Success Feedback**: Confirmation prompt after successful operation
2. **Error Message**: Warning for operation failure or exception
3. **Info Notification**: Reminder for important information
4. **Loading State**: Progress prompt for long-running operations

For more detailed information, please check the complete README documentation.
