import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach } from 'vitest';

// Mock Vietnamese locale data
const mockVietnameseLocale = {
  'vi-VN': {
    chat: {
      clearHistory: 'Xóa lịch sử',
      newChat: 'Cuộc trò chuyện mới',
      placeholder: 'Nhập tin nhắn của bạn...',
      send: 'Gửi',
    },
    common: {
      cancel: 'Hủy bỏ',
      confirm: 'Xác nhận',
      delete: 'Xóa',
      edit: 'Chỉnh sửa',
      error: 'Lỗi',
      loading: 'Đang tải...',
      save: 'Lưu',
      success: 'Thành công',
    },
    setting: {
      language: 'Ngôn ngữ',
      model: 'Mô hình AI',
      theme: 'Giao diện',
      voice: 'Giọng nói',
    },
  },
};

// Mock mobile viewport dimensions
const mobileViewports = {
  'Samsung Galaxy S21': { height: 800, width: 360 },
  'Xiaomi Redmi Note 10': { height: 851, width: 393 },
  'iPhone 12 Pro': { height: 844, width: 390 },
};

// Mock Vietnamese voice settings
const vietnameseVoiceSettings = {
  stt: {
    continuous: true,
    interimResults: true,
    language: 'vi-VN',
  },
  tts: {
    pitch: 1,
    rate: 1,
    voice: 'vi-VN-HoaiMyNeural',
    volume: 1,
  },
};

// Mock currency formatting for VND
const mockCurrencyFormatter = {
  format: (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      currency: 'VND',
      minimumFractionDigits: 0,
      style: 'currency',
    }).format(amount);
  },
};

// Mock date/time formatting for Vietnam
const mockDateTimeFormatter = {
  formatDate: (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  },
  formatTime: (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
    }).format(date);
  },
};

// Mock network conditions for mobile testing
const mockNetworkConditions = {
  '3G': {
    downloadThroughput: 500_000,
    latency: 400,
    uploadThroughput: 500_000,
  },
  '4G': {
    downloadThroughput: 4_000_000,
    latency: 20,
    uploadThroughput: 3_000_000,
  },
};

// Setup global mocks for Vietnam market testing
beforeAll(() => {
  // Mock window.matchMedia for responsive testing
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => {},
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    }),
    writable: true,
  });

  // Mock ResizeObserver for responsive components
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock IntersectionObserver for lazy loading (typing compatible)
  global.IntersectionObserver = class IntersectionObserver {
    root: Element | Document | null = null;
    rootMargin: string = '0px';
    thresholds: ReadonlyArray<number> = [0];
    constructor(_callback: any, _options?: any) {
      void _callback;
      void _options;
    }
    observe(_target: Element) {
      void _target;
    }
    unobserve(_target: Element) {
      void _target;
    }
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  } as unknown as typeof IntersectionObserver;

  // Mock Web Speech API for voice features
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      cancel: () => {},
      getVoices: () => [
        {
          default: true,
          lang: 'vi-VN',
          localService: false,
          name: 'vi-VN-HoaiMyNeural',
          voiceURI: 'vi-VN-HoaiMyNeural',
        },
      ],
      pause: () => {},
      resume: () => {},
      speak: () => {},
    },
    writable: true,
  });

  // Mock SpeechRecognition for STT
  Object.defineProperty(window, 'SpeechRecognition', {
    value: class MockSpeechRecognition {
      continuous = true;
      interimResults = true;
      lang = 'vi-VN';
      start() {}
      stop() {}
      abort() {}
    },
    writable: true,
  });

  // Mock localStorage for settings persistence
  const localStorageMock = {
    clear: () => {},
    getItem: (key: string) => {
      if (key === 'lobe-chat-locale') return 'vi-VN';
      if (key === 'lobe-chat-currency') return 'VND';
      if (key === 'lobe-chat-voice-settings') return JSON.stringify(vietnameseVoiceSettings);
      return null;
    },
    removeItem: () => {},
    setItem: () => {},
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // Mock navigator for mobile detection
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
    writable: true,
  });

  // Mock touch events for mobile testing
  Object.defineProperty(window, 'ontouchstart', { value: {} });
});

beforeEach(() => {
  // Set Vietnamese locale as default for each test
  process.env.NEXT_PUBLIC_DEFAULT_LANG = 'vi-VN';
  process.env.DEFAULT_CURRENCY = 'VND';

  // Mock viewport for mobile testing
  Object.defineProperty(window, 'innerWidth', { value: 390, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: 844, writable: true });
});

afterEach(() => {
  cleanup();
});

// Export utilities for tests
export {
  mobileViewports,
  mockCurrencyFormatter,
  mockDateTimeFormatter,
  mockNetworkConditions,
  mockVietnameseLocale,
  vietnameseVoiceSettings,
};
