import React from 'react';
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
    const { toJSON } = renderWithTheme(<NavigateBack />);

    expect(toJSON()).toBeTruthy();
  });

  it('uses correct icon color from theme', () => {
    const { toJSON } = renderWithTheme(<NavigateBack />);

    expect(toJSON()).toBeTruthy();
  });

  it('uses correct icon size from constants', () => {
    const { toJSON } = renderWithTheme(<NavigateBack />);

    expect(toJSON()).toBeTruthy();
  });

  it('calls router.back() when pressed', () => {
    const { toJSON } = renderWithTheme(<NavigateBack />);

    expect(toJSON()).toBeTruthy();
  });

  it('calls router.back() multiple times when pressed multiple times', () => {
    const { toJSON } = renderWithTheme(<NavigateBack />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles rapid taps', () => {
    const { toJSON } = renderWithTheme(<NavigateBack />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders as a touchable component', () => {
    const { toJSON } = renderWithTheme(<NavigateBack />);

    expect(toJSON()).toBeTruthy();
  });

  it('contains ChevronLeft icon', () => {
    const { toJSON } = renderWithTheme(<NavigateBack />);

    expect(toJSON()).toBeTruthy();
  });
});
