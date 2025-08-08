import React from 'react';
import { act, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, View } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import { ToastProvider, useToast } from '../ToastProvider';

jest.mock('lucide-react-native', () => ({
  CheckCircle: () => <View testID="check-icon" />,
  XCircle: () => <View testID="x-circle-icon" />,
  Info: () => <View testID="info-icon" />,
  RefreshCw: () => <View testID="refresh-icon" />,
  X: () => <View testID="x-icon" />,
}));

// Test component to access toast methods
const TestComponent = () => {
  const toast = useToast();

  return (
    <View>
      <TouchableOpacity testID="success-btn" onPress={() => toast.success('Success!')} />
      <TouchableOpacity testID="error-btn" onPress={() => toast.error('Error!')} />
      <TouchableOpacity testID="info-btn" onPress={() => toast.info('Info!')} />
      <TouchableOpacity testID="loading-btn" onPress={() => toast.loading('Loading...')} />
    </View>
  );
};

describe('Toast', () => {
  const renderToastProvider = () => {
    return renderWithTheme(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('shows success toast', () => {
    const { getByTestId, getByText } = renderToastProvider();

    act(() => {
      fireEvent.press(getByTestId('success-btn'));
    });

    expect(getByText('Success!')).toBeTruthy();
  });

  it('shows error toast', () => {
    const { getByTestId, getByText } = renderToastProvider();

    act(() => {
      fireEvent.press(getByTestId('error-btn'));
    });

    expect(getByText('Error!')).toBeTruthy();
  });

  it('shows info toast', () => {
    const { getByTestId, getByText } = renderToastProvider();

    act(() => {
      fireEvent.press(getByTestId('info-btn'));
    });

    expect(getByText('Info!')).toBeTruthy();
  });

  it('shows loading toast', () => {
    const { getByTestId, getByText } = renderToastProvider();

    act(() => {
      fireEvent.press(getByTestId('loading-btn'));
    });

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('auto-dismisses toast after duration', () => {
    const { getByTestId, getByText, queryByText } = renderToastProvider();

    act(() => {
      fireEvent.press(getByTestId('success-btn'));
    });

    expect(getByText('Success!')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(queryByText('Success!')).toBeFalsy();
  });
});
