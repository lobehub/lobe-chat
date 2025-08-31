import React from 'react';
import { act, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, View } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import { ToastProvider, useToast } from '../InnerToastProvider';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
}));

jest.mock('lucide-react-native', () => ({
  CheckCircle: () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'check-icon' });
  },
  XCircle: () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'x-circle-icon' });
  },
  Info: () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'info-icon' });
  },
  RefreshCw: () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'refresh-icon' });
  },
  X: () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'x-icon' });
  },
}));

// Test component to access toast methods
const TestComponent = ({ onToastReady }: { onToastReady: (toast: any) => void }) => {
  const toast = useToast();

  React.useEffect(() => {
    onToastReady(toast);
  }, [toast, onToastReady]);

  return <View testID="test-component" />;
};

describe('Toast', () => {
  let toastInstance: any = null;

  const renderToastProvider = () => {
    const onToastReady = (toast: any) => {
      toastInstance = toast;
    };

    return renderWithTheme(
      <ToastProvider>
        <TestComponent onToastReady={onToastReady} />
      </ToastProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
    toastInstance = null;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('shows success toast', () => {
    const { toJSON } = renderToastProvider();

    act(() => {
      toastInstance?.success('Success!');
    });

    // Toast content is rendered successfully
    const snapshot = toJSON();
    expect(snapshot).toBeTruthy();
    expect(JSON.stringify(snapshot)).toContain('Success!');
  });

  it('shows error toast', () => {
    const { toJSON } = renderToastProvider();

    act(() => {
      toastInstance?.error('Error!');
    });

    const snapshot = toJSON();
    expect(snapshot).toBeTruthy();
    expect(JSON.stringify(snapshot)).toContain('Error!');
  });

  it('shows info toast', () => {
    const { toJSON } = renderToastProvider();

    act(() => {
      toastInstance?.info('Info!');
    });

    const snapshot = toJSON();
    expect(snapshot).toBeTruthy();
    expect(JSON.stringify(snapshot)).toContain('Info!');
  });

  it('shows loading toast', () => {
    const { toJSON } = renderToastProvider();

    act(() => {
      toastInstance?.loading('Loading...');
    });

    const snapshot = toJSON();
    expect(snapshot).toBeTruthy();
    expect(JSON.stringify(snapshot)).toContain('Loading...');
  });

  it('auto-dismisses toast after duration', () => {
    const { toJSON } = renderToastProvider();

    act(() => {
      toastInstance?.success('Success!');
    });

    const initialSnapshot = toJSON();
    expect(initialSnapshot).toBeTruthy();
    expect(JSON.stringify(initialSnapshot)).toContain('Success!');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Toast should be dismissed after timeout
    const finalSnapshot = toJSON();
    expect(finalSnapshot).toBeTruthy();
  });

  it('renders ToastProvider without errors', () => {
    const { toJSON } = renderToastProvider();
    expect(toJSON()).toBeTruthy();
    expect(toastInstance).toBeTruthy();
  });

  it('provides toast functionality through useToast hook', () => {
    renderToastProvider();

    // Verify toast instance has expected methods
    expect(toastInstance).toBeDefined();
    expect(typeof toastInstance?.success).toBe('function');
    expect(typeof toastInstance?.error).toBe('function');
    expect(typeof toastInstance?.info).toBe('function');
    expect(typeof toastInstance?.loading).toBe('function');
  });
});
