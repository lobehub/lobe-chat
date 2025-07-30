import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { renderWithTheme } from '@/mobile/test/utils';
import Toast from '../Toast';

jest.mock('lucide-react-native', () => ({
  CheckCircle: ({ color, size }: { color: string; size: number }) => (
    <div data-testid="check-circle" data-color={color} data-size={size}>
      ✓
    </div>
  ),
  XCircle: ({ color, size }: { color: string; size: number }) => (
    <div data-testid="x-circle" data-color={color} data-size={size}>
      ✗
    </div>
  ),
  Info: ({ color, size }: { color: string; size: number }) => (
    <div data-testid="info" data-color={color} data-size={size}>
      i
    </div>
  ),
  RefreshCw: ({ color, size }: { color: string; size: number }) => (
    <div data-testid="refresh-cw" data-color={color} data-size={size}>
      ⟳
    </div>
  ),
  X: ({ color, size }: { color: string; size: number }) => (
    <div data-testid="x" data-color={color} data-size={size}>
      ×
    </div>
  ),
}));

jest.mock('@/mobile/const/common', () => ({
  ICON_SIZE_SMALL: 16,
}));

jest.mock('@/mobile/theme', () => ({
  useThemeToken: () => ({
    colorSuccess: '#52c41a',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    colorText: '#000000',
  }),
}));

describe('Toast', () => {
  const mockOpacity = new Animated.Value(1);
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders success toast correctly', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <Toast
        id="success-toast"
        message="Success message"
        type="success"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Success message')).toBeTruthy();
    expect(getByTestId('check-circle')).toBeTruthy();
  });

  it('renders error toast correctly', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <Toast
        id="error-toast"
        message="Error message"
        type="error"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Error message')).toBeTruthy();
    expect(getByTestId('x-circle')).toBeTruthy();
  });

  it('renders info toast correctly', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <Toast
        id="info-toast"
        message="Info message"
        type="info"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Info message')).toBeTruthy();
    expect(getByTestId('info')).toBeTruthy();
  });

  it('renders loading toast correctly', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <Toast
        id="loading-toast"
        message="Loading message"
        type="loading"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Loading message')).toBeTruthy();
    expect(getByTestId('refresh-cw')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <Toast
        id="closeable-toast"
        message="Closeable message"
        type="info"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    const closeButton = getByTestId('x');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith('closeable-toast');
  });

  it('renders without onClose callback', () => {
    const { getByText } = renderWithTheme(
      <Toast id="no-close-toast" message="No close message" type="info" opacity={mockOpacity} />,
    );

    expect(getByText('No close message')).toBeTruthy();
  });

  it('renders with custom duration', () => {
    const { getByText } = renderWithTheme(
      <Toast
        id="duration-toast"
        message="Duration message"
        type="info"
        opacity={mockOpacity}
        duration={5000}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Duration message')).toBeTruthy();
  });

  it('uses correct icon colors', () => {
    const { getByTestId } = renderWithTheme(
      <Toast
        id="success-toast"
        message="Success"
        type="success"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    const icon = getByTestId('check-circle');
    expect(icon.getAttribute('data-color')).toBe('#52c41a');
  });

  it('uses correct icon sizes', () => {
    const { getByTestId } = renderWithTheme(
      <Toast
        id="info-toast"
        message="Info"
        type="info"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    const icon = getByTestId('info');
    expect(icon.getAttribute('data-size')).toBe('16');
  });

  it('renders long messages correctly', () => {
    const longMessage =
      'This is a very long toast message that might need to wrap to multiple lines and should be handled gracefully by the component';
    const { getByText } = renderWithTheme(
      <Toast
        id="long-toast"
        message={longMessage}
        type="info"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    expect(getByText(longMessage)).toBeTruthy();
  });

  it('renders empty message', () => {
    const { getByText } = renderWithTheme(
      <Toast id="empty-toast" message="" type="info" opacity={mockOpacity} onClose={mockOnClose} />,
    );

    expect(getByText('')).toBeTruthy();
  });

  it('handles different toast IDs', () => {
    const { getByText } = renderWithTheme(
      <Toast
        id="unique-id-123"
        message="Unique ID message"
        type="info"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Unique ID message')).toBeTruthy();
  });

  it('handles close button press with specific ID', () => {
    const { getByTestId } = renderWithTheme(
      <Toast
        id="specific-id"
        message="Specific ID message"
        type="success"
        opacity={mockOpacity}
        onClose={mockOnClose}
      />,
    );

    const closeButton = getByTestId('x');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith('specific-id');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with animated opacity', () => {
    const animatedOpacity = new Animated.Value(0.5);
    const { getByText } = renderWithTheme(
      <Toast
        id="animated-toast"
        message="Animated message"
        type="info"
        opacity={animatedOpacity}
        onClose={mockOnClose}
      />,
    );

    expect(getByText('Animated message')).toBeTruthy();
  });

  it('renders all toast types with their respective icons', () => {
    const types = ['success', 'error', 'info', 'loading'] as const;
    const expectedIcons = ['check-circle', 'x-circle', 'info', 'refresh-cw'];

    types.forEach((type, index) => {
      const { getByTestId } = renderWithTheme(
        <Toast
          id={`${type}-toast`}
          message={`${type} message`}
          type={type}
          opacity={mockOpacity}
          onClose={mockOnClose}
        />,
      );

      expect(getByTestId(expectedIcons[index])).toBeTruthy();
    });
  });
});
