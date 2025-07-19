// Theme colors
export const BACKGROUND_DARK = '#000';
export const BACKGROUND_LIGHT = '#f8f8f8';
export const SYMBOL_COLOR_DARK = '#ffffff80';
export const SYMBOL_COLOR_LIGHT = '#00000080';

// Window dimensions and constraints
export const TITLE_BAR_HEIGHT = 29;

// Default window configuration
export const DEFAULT_WINDOW_CONFIG = {
  DEFAULT_HEIGHT: 800,
  DEFAULT_WIDTH: 1200,
  DEVTOOLS_WINDOW: {
    HEIGHT: 600,
    WIDTH: 1000,
  },
  MIN_HEIGHT: 600,

  MIN_WIDTH: 480,

  PROVIDER_WINDOW: {
    HEIGHT: 1000,
    WIDTH: 1400,
  },

  SETTINGS_WINDOW: {
    HEIGHT: 800,
    MIN_WIDTH: 600,
    WIDTH: 1000,
  },

  THEME_CHANGE_DELAY: 100,
} as const;

// Retry connection configuration
export const RETRY_CONNECTION_CONFIG = {
  RETRY_HANDLER_PREFIX: 'retry-connection-',
} as const;
