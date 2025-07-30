import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/test/utils';
import NavigateBack from '../index';

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: ({ color, size }: { color: string; size: number }) => (
    <div data-testid="chevron-left" data-color={color} data-size={size}>
      ChevronLeft
    </div>
  ),
}));

jest.mock('@/const/common', () => ({
  ICON_SIZE: 24,
}));

jest.mock('@/theme', () => ({
  useThemeToken: () => ({
    colorText: '#000000',
  }),
}));

describe('NavigateBack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = renderWithTheme(<NavigateBack />);

    expect(getByTestId('chevron-left')).toBeTruthy();
  });

  it('uses correct icon color from theme', () => {
    const { getByTestId } = renderWithTheme(<NavigateBack />);

    const icon = getByTestId('chevron-left');
    expect(icon.getAttribute('data-color')).toBe('#000000');
  });

  it('uses correct icon size from constants', () => {
    const { getByTestId } = renderWithTheme(<NavigateBack />);

    const icon = getByTestId('chevron-left');
    expect(icon.getAttribute('data-size')).toBe('24');
  });

  it('calls router.back() when pressed', () => {
    const { getByRole } = renderWithTheme(<NavigateBack />);

    fireEvent.press(getByRole('button'));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('calls router.back() multiple times when pressed multiple times', () => {
    const { getByRole } = renderWithTheme(<NavigateBack />);

    const button = getByRole('button');
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(mockRouter.back).toHaveBeenCalledTimes(3);
  });

  it('handles rapid taps', () => {
    const { getByRole } = renderWithTheme(<NavigateBack />);

    const button = getByRole('button');

    // Simulate rapid tapping
    for (let i = 0; i < 5; i++) {
      fireEvent.press(button);
    }

    expect(mockRouter.back).toHaveBeenCalledTimes(5);
  });

  it('renders as a touchable component', () => {
    const { getByRole } = renderWithTheme(<NavigateBack />);

    expect(getByRole('button')).toBeTruthy();
  });

  it('contains ChevronLeft icon', () => {
    const { getByTestId } = renderWithTheme(<NavigateBack />);

    expect(getByTestId('chevron-left')).toBeTruthy();
  });
});
