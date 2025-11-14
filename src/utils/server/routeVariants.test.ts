import { describe, expect, it } from 'vitest';

import { DEFAULT_LANG } from '@/const/locale';
import { DynamicLayoutProps } from '@/types/next';

import { DEFAULT_VARIANTS, IRouteVariants, RouteVariants } from './routeVariants';

describe('RouteVariants', () => {
  describe('DEFAULT_VARIANTS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_VARIANTS).toEqual({
        isMobile: false,
        locale: DEFAULT_LANG,
        theme: 'light',
      });
    });
  });

  describe('serializeVariants', () => {
    it('should serialize variants with default values', () => {
      const variants: IRouteVariants = {
        isMobile: false,
        locale: 'en-US',
        theme: 'light',
      };
      const result = RouteVariants.serializeVariants(variants);
      expect(result).toBe('en-US__0__light');
    });

    it('should serialize variants with mobile enabled', () => {
      const variants: IRouteVariants = {
        isMobile: true,
        locale: 'zh-CN',
        theme: 'dark',
      };
      const result = RouteVariants.serializeVariants(variants);
      expect(result).toBe('zh-CN__1__dark');
    });

    it('should serialize variants with different locales', () => {
      const variants: IRouteVariants = {
        isMobile: false,
        locale: 'ja-JP',
        theme: 'light',
      };
      const result = RouteVariants.serializeVariants(variants);
      expect(result).toBe('ja-JP__0__light');
    });

    it('should serialize variants with custom colors', () => {
      const variants: IRouteVariants = {
        isMobile: true,
        locale: 'en-US',
        neutralColor: '#cccccc',
        primaryColor: '#ff0000',
        theme: 'dark',
      };
      const result = RouteVariants.serializeVariants(variants);
      expect(result).toBe('en-US__1__dark');
    });
  });

  describe('deserializeVariants', () => {
    it('should deserialize valid serialized string', () => {
      const serialized = 'en-US__0__light';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result).toEqual({
        isMobile: false,
        locale: 'en-US',
        theme: 'light',
      });
    });

    it('should deserialize mobile variants', () => {
      const serialized = 'zh-CN__1__dark';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result).toEqual({
        isMobile: true,
        locale: 'zh-CN',
        theme: 'dark',
      });
    });

    it('should return default values for invalid serialized string', () => {
      const serialized = 'invalid';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result).toEqual(DEFAULT_VARIANTS);
    });

    it('should return default values for empty string', () => {
      const serialized = '';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result).toEqual(DEFAULT_VARIANTS);
    });

    it('should handle invalid locale by falling back to default', () => {
      const serialized = 'invalid-locale__0__light';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result).toEqual({
        isMobile: false,
        locale: DEFAULT_LANG,
        theme: 'light',
      });
    });

    it('should handle invalid theme by falling back to default', () => {
      const serialized = 'en-US__0__invalid-theme';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result).toEqual({
        isMobile: false,
        locale: 'en-US',
        theme: 'light',
      });
    });

    it('should handle malformed serialized string', () => {
      const serialized = 'en-US';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result).toEqual(DEFAULT_VARIANTS);
    });

    it('should handle isMobile value correctly for "0"', () => {
      const serialized = 'en-US__0__dark';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result.isMobile).toBe(false);
    });

    it('should handle isMobile value correctly for "1"', () => {
      const serialized = 'en-US__1__dark';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result.isMobile).toBe(true);
    });

    it('should handle isMobile value correctly for other values', () => {
      const serialized = 'en-US__2__dark';
      const result = RouteVariants.deserializeVariants(serialized);
      expect(result.isMobile).toBe(false);
    });
  });

  describe('getVariantsFromProps', () => {
    it('should extract and deserialize variants from props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'en-US__0__light' }),
      };
      const result = await RouteVariants.getVariantsFromProps(props);
      expect(result).toEqual({
        isMobile: false,
        locale: 'en-US',
        theme: 'light',
      });
    });

    it('should handle mobile variants from props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'zh-CN__1__dark' }),
      };
      const result = await RouteVariants.getVariantsFromProps(props);
      expect(result).toEqual({
        isMobile: true,
        locale: 'zh-CN',
        theme: 'dark',
      });
    });

    it('should handle invalid variants in props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'invalid' }),
      };
      const result = await RouteVariants.getVariantsFromProps(props);
      expect(result).toEqual(DEFAULT_VARIANTS);
    });
  });

  describe('getIsMobile', () => {
    it('should extract isMobile as false from props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'en-US__0__light' }),
      };
      const result = await RouteVariants.getIsMobile(props);
      expect(result).toBe(false);
    });

    it('should extract isMobile as true from props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'en-US__1__dark' }),
      };
      const result = await RouteVariants.getIsMobile(props);
      expect(result).toBe(true);
    });

    it('should return default isMobile for invalid props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'invalid' }),
      };
      const result = await RouteVariants.getIsMobile(props);
      expect(result).toBe(DEFAULT_VARIANTS.isMobile);
    });
  });

  describe('getLocale', () => {
    it('should extract locale from props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'zh-CN__0__light' }),
      };
      const result = await RouteVariants.getLocale(props);
      expect(result).toBe('zh-CN');
    });

    it('should extract different locale from props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'ja-JP__1__dark' }),
      };
      const result = await RouteVariants.getLocale(props);
      expect(result).toBe('ja-JP');
    });

    it('should return default locale for invalid props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'invalid' }),
      };
      const result = await RouteVariants.getLocale(props);
      expect(result).toBe(DEFAULT_LANG);
    });

    it('should return default locale for invalid locale in props', async () => {
      const props: DynamicLayoutProps = {
        params: Promise.resolve({ variants: 'invalid-locale__0__light' }),
      };
      const result = await RouteVariants.getLocale(props);
      expect(result).toBe(DEFAULT_LANG);
    });
  });

  describe('createVariants', () => {
    it('should create variants with default values when no options provided', () => {
      const result = RouteVariants.createVariants();
      expect(result).toEqual(DEFAULT_VARIANTS);
    });

    it('should create variants with custom isMobile', () => {
      const result = RouteVariants.createVariants({ isMobile: true });
      expect(result).toEqual({
        ...DEFAULT_VARIANTS,
        isMobile: true,
      });
    });

    it('should create variants with custom locale', () => {
      const result = RouteVariants.createVariants({ locale: 'zh-CN' });
      expect(result).toEqual({
        ...DEFAULT_VARIANTS,
        locale: 'zh-CN',
      });
    });

    it('should create variants with custom theme', () => {
      const result = RouteVariants.createVariants({ theme: 'dark' });
      expect(result).toEqual({
        ...DEFAULT_VARIANTS,
        theme: 'dark',
      });
    });

    it('should create variants with multiple custom options', () => {
      const result = RouteVariants.createVariants({
        isMobile: true,
        locale: 'ja-JP',
        theme: 'dark',
      });
      expect(result).toEqual({
        isMobile: true,
        locale: 'ja-JP',
        theme: 'dark',
      });
    });

    it('should create variants with custom colors', () => {
      const result = RouteVariants.createVariants({
        neutralColor: '#cccccc',
        primaryColor: '#ff0000',
      });
      expect(result).toEqual({
        ...DEFAULT_VARIANTS,
        neutralColor: '#cccccc',
        primaryColor: '#ff0000',
      });
    });

    it('should create variants with all custom options', () => {
      const result = RouteVariants.createVariants({
        isMobile: true,
        locale: 'zh-CN',
        neutralColor: '#aaaaaa',
        primaryColor: '#00ff00',
        theme: 'dark',
      });
      expect(result).toEqual({
        isMobile: true,
        locale: 'zh-CN',
        neutralColor: '#aaaaaa',
        primaryColor: '#00ff00',
        theme: 'dark',
      });
    });
  });

  describe('roundtrip serialization', () => {
    it('should maintain data integrity through serialize and deserialize', () => {
      const original: IRouteVariants = {
        isMobile: true,
        locale: 'zh-CN',
        theme: 'dark',
      };
      const serialized = RouteVariants.serializeVariants(original);
      const deserialized = RouteVariants.deserializeVariants(serialized);
      expect(deserialized).toEqual(original);
    });

    it('should maintain data integrity for default variants', () => {
      const serialized = RouteVariants.serializeVariants(DEFAULT_VARIANTS);
      const deserialized = RouteVariants.deserializeVariants(serialized);
      expect(deserialized).toEqual(DEFAULT_VARIANTS);
    });

    it('should maintain data integrity for various locales', () => {
      const locales = ['en-US', 'zh-CN', 'ja-JP', 'ko-KR', 'fr-FR'];
      locales.forEach((locale) => {
        const original: IRouteVariants = {
          isMobile: false,
          locale: locale as any,
          theme: 'light',
        };
        const serialized = RouteVariants.serializeVariants(original);
        const deserialized = RouteVariants.deserializeVariants(serialized);
        expect(deserialized).toEqual(original);
      });
    });
  });
});
