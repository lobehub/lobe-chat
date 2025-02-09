import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
  APP_URL,
  ASSISTANT_INDEX_URL,
  PLUGINS_INDEX_URL,
  getAppConfig,
  isInVercel,
  vercelUrl,
} from './app';

vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn((config) => config.runtimeEnv),
}));

describe('getAppConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      NODE_ENV: 'test',
      NEXT_PUBLIC_DEVELOPER_DEBUG: '0',
      NEXT_PUBLIC_I18N_DEBUG: '0',
      NEXT_PUBLIC_I18N_DEBUG_BROWSER: '0',
      NEXT_PUBLIC_I18N_DEBUG_SERVER: '0',
    };
  });

  it('should return app config with default values', () => {
    const config = getAppConfig();

    expect(config).toEqual({
      NEXT_PUBLIC_BASE_PATH: '',
      NEXT_PUBLIC_ENABLE_SENTRY: false,
      ACCESS_CODES: [],
      AGENTS_INDEX_URL: ASSISTANT_INDEX_URL,
      DEFAULT_AGENT_CONFIG: '',
      SYSTEM_AGENT: undefined,
      PLUGINS_INDEX_URL: PLUGINS_INDEX_URL,
      PLUGIN_SETTINGS: undefined,
      VERCEL_EDGE_CONFIG: undefined,
      APP_URL: undefined,
      MIDDLEWARE_REWRITE_THROUGH_LOCAL: false,
      CUSTOM_FONT_FAMILY: undefined,
      CUSTOM_FONT_URL: undefined,
      CDN_USE_GLOBAL: false,
      SSRF_ALLOW_PRIVATE_IP_ADDRESS: false,
      SSRF_ALLOW_IP_ADDRESS_LIST: undefined,
    });
  });

  it('should parse ACCESS_CODE correctly', () => {
    process.env.ACCESS_CODE = 'code1,code2,code3';
    const config = getAppConfig();
    expect(config.ACCESS_CODES).toEqual(['code1', 'code2', 'code3']);
  });

  it('should use custom AGENTS_INDEX_URL if provided', () => {
    process.env.AGENTS_INDEX_URL = 'https://custom.agents.index';
    const config = getAppConfig();
    expect(config.AGENTS_INDEX_URL).toBe('https://custom.agents.index');
  });

  it('should use custom PLUGINS_INDEX_URL if provided', () => {
    process.env.PLUGINS_INDEX_URL = 'https://custom.plugins.index';
    const config = getAppConfig();
    expect(config.PLUGINS_INDEX_URL).toBe('https://custom.plugins.index');
  });

  it('should parse boolean flags correctly', () => {
    process.env.CDN_USE_GLOBAL = '1';
    process.env.SSRF_ALLOW_PRIVATE_IP_ADDRESS = '1';
    process.env.MIDDLEWARE_REWRITE_THROUGH_LOCAL = '1';

    const config = getAppConfig();

    expect(config.CDN_USE_GLOBAL).toBe(true);
    expect(config.SSRF_ALLOW_PRIVATE_IP_ADDRESS).toBe(true);
    expect(config.MIDDLEWARE_REWRITE_THROUGH_LOCAL).toBe(true);
  });

  it('should handle custom font settings', () => {
    process.env.CUSTOM_FONT_FAMILY = 'Custom Font';
    process.env.CUSTOM_FONT_URL = 'https://fonts.custom/font.css';

    const config = getAppConfig();

    expect(config.CUSTOM_FONT_FAMILY).toBe('Custom Font');
    expect(config.CUSTOM_FONT_URL).toBe('https://fonts.custom/font.css');
  });
});

describe('URL constants', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      NODE_ENV: 'test',
      NEXT_PUBLIC_DEVELOPER_DEBUG: '0',
      NEXT_PUBLIC_I18N_DEBUG: '0',
      NEXT_PUBLIC_I18N_DEBUG_BROWSER: '0',
      NEXT_PUBLIC_I18N_DEBUG_SERVER: '0',
    };
  });

  it('should set vercelUrl correctly when in Vercel environment', async () => {
    process.env.VERCEL = '1';
    process.env.VERCEL_URL = 'my-app.vercel.app';
    const { vercelUrl } = await import('./app');
    expect(vercelUrl).toBe('https://my-app.vercel.app');
  });

  it('should set APP_URL correctly based on environment', async () => {
    process.env.APP_URL = 'https://custom.app.url';
    const { APP_URL } = await import('./app');
    expect(APP_URL).toBe('https://custom.app.url');
  });

  it('should detect Vercel environment correctly', async () => {
    process.env.VERCEL = '1';
    let mod = await import('./app');
    expect(mod.isInVercel).toBe(true);

    vi.resetModules();
    process.env = {
      NODE_ENV: 'test',
      NEXT_PUBLIC_DEVELOPER_DEBUG: '0',
      NEXT_PUBLIC_I18N_DEBUG: '0',
      NEXT_PUBLIC_I18N_DEBUG_BROWSER: '0',
      NEXT_PUBLIC_I18N_DEBUG_SERVER: '0',
    };

    mod = await import('./app');
    expect(mod.isInVercel).toBe(false);
  });
});
