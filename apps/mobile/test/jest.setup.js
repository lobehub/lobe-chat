// Mock React Native polyfills that use Flow types
jest.mock('@react-native/js-polyfills/error-guard', () => ({}));
jest.mock('@react-native/js-polyfills/console', () => ({}));
jest.mock('@react-native/js-polyfills', () => ({}));

// Mock crypto for React Native
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr) => {
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
      }
      return arr;
    },
  };
}

// Mock React Native SVG
jest.mock('react-native-svg', () => ({
  SvgUri: jest.fn().mockImplementation(({ uri, accessibilityLabel, onError }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, {
      'testID': 'svg-uri',
      'data-uri': uri,
      'data-label': accessibilityLabel,
      'onPress': onError,
    });
  }),
}));

// Mock React Native WebView
jest.mock('react-native-webview', () => ({
  WebView: jest.fn().mockImplementation(({ source, onError, onHttpError, onMessage, style }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, {
      'testID': 'webview',
      'data-source': source,
      style,
      'onPress': onError,
    });
  }),
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  const mockAnimation = {
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  };

  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      loop: jest.fn((anim) => mockAnimation),
      sequence: jest.fn((anims) => mockAnimation),
      timing: jest.fn((value, config) => mockAnimation),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        interpolate: jest.fn(() => ({ setValue: jest.fn() })),
      })),
    },
  };
});

// Mock Markdown dependencies
jest.mock(
  'react-native-markdown-display',
  () => ({
    MarkdownIt: jest.fn(() => ({
      use: jest.fn(() => ({})),
      render: jest.fn(() => 'mocked markdown'),
    })),
  }),
  { virtual: true },
);

jest.mock('markdown-it-mathjax3', () => jest.fn(), { virtual: true });

// Mock MathJax
jest.mock('react-native-mathjax-html-to-svg', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    MathJaxSvg: jest.fn().mockImplementation(({ children, fontSize, color, style }) => {
      return React.createElement(
        View,
        {
          style,
          'testID': 'mathjax',
          'data-font-size': fontSize,
          'data-color': color,
        },
        React.createElement(Text, {}, children),
      );
    }),
  };
});

// Silence console warnings during tests
console.warn = jest.fn();
console.error = jest.fn();
