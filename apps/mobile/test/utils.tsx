import { ThemeProvider } from '@lobehub/ui-rn';
import { render } from '@testing-library/react-native';
import React from 'react';

// Mock the setting store
jest.mock('@/store/setting', () => ({
  useSettingStore: jest.fn(() => ({
    setThemeMode: jest.fn(),
    themeMode: 'light',
  })),
}));

// Mock MMKV
jest.mock('react-native-mmkv', () => {
  const mockStorage = new Map<string, string>();

  return {
    MMKV: jest.fn().mockImplementation(() => ({
      clearAll: jest.fn(() => {
        mockStorage.clear();
      }),
      contains: jest.fn((key: string) => {
        return mockStorage.has(key);
      }),
      delete: jest.fn((key: string) => {
        mockStorage.delete(key);
      }),
      getAllKeys: jest.fn(() => {
        return Array.from(mockStorage.keys());
      }),
      getBoolean: jest.fn((key: string) => {
        const value = mockStorage.get(key);
        return value === 'true';
      }),
      getNumber: jest.fn((key: string) => {
        const value = mockStorage.get(key);
        return value ? Number(value) : undefined;
      }),
      getString: jest.fn((key: string) => {
        return mockStorage.get(key);
      }),
      set: jest.fn((key: string, value: string | number | boolean) => {
        mockStorage.set(key, String(value));
      }),
    })),
  };
});

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
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

// Create a rerender function that also uses the theme wrapper (deprecated, use rerender from renderWithTheme)
export const rerenderWithTheme = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

// Re-export everything from testing library
export * from '@testing-library/react-native';
