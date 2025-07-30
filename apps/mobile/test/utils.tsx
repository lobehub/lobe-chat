import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme/context';

// Mock the setting store
jest.mock('@/store/setting', () => ({
  useSettingStore: jest.fn(() => ({
    setThemeMode: jest.fn(),
    themeMode: 'light',
  })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock Markdown dependencies
jest.mock('react-native-markdown-display', () => ({
  MarkdownIt: jest.fn(() => ({
    render: jest.fn(() => 'mocked markdown'),
    use: jest.fn(() => ({})),
  })),
}));

jest.mock('markdown-it-mathjax3', () => jest.fn());

// Mock React Native's useColorScheme
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: jest.fn(() => 'light'),
  };
});

// Mock createStyles with proper token structure
const mockToken = {
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  borderRadiusXS: 4,
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorBorder: '#d9d9d9',
  colorError: '#ff4d4f',
  colorErrorBg: '#fff2f0',
  colorFillSecondary: '#f5f5f5',
  colorPrimary: '#1677ff',
  colorPrimaryBg: '#e6f7ff',
  colorSuccess: '#52c41a',
  colorText: '#000000',
  colorTextSecondary: '#666666',
  colorWarning: '#faad14',
  margin: 16,
  marginLG: 24,
  marginSM: 12,
  marginXS: 8,
  padding: 16,
  paddingLG: 24,
  paddingSM: 12,
  paddingXS: 8,
  size: 40,
  sizeLG: 48,
  sizeSM: 32,
  sizeXS: 24,
};

jest.mock('@/theme', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  createStyles: jest.fn((fn) => (params = {}) => ({
    styles: fn(mockToken, {
      backgroundColor: '#ffffff',
      size: 40,
      ...params,
    }),
  })),
  useTheme: jest.fn(() => ({
    theme: {
      isDark: false,
      token: mockToken,
    },
  })),
  useThemeToken: jest.fn(() => mockToken),
}));

// Test wrapper component with ThemeProvider
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

// Custom render function that includes ThemeProvider
export const renderWithTheme = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

// Create a rerender function that also uses the theme wrapper
export const rerenderWithTheme = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

// Re-export everything from testing library
export * from '@testing-library/react-native';
