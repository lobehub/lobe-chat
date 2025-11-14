// Define theme type
import { ThemeAppearance } from 'antd-style/lib/types/appearance';

import { DEFAULT_LANG } from '@/const/locale';
import { Locales, locales } from '@/locales/resources';
import { DynamicLayoutProps } from '@/types/next';

// Define variant interface
export interface IRouteVariants {
  isMobile: boolean;
  locale: Locales;
  neutralColor?: string;
  primaryColor?: string;
  theme: ThemeAppearance;
}

// Supported themes
const SUPPORTED_THEMES = ['dark', 'light'] as const;

// Default variant configuration
export const DEFAULT_VARIANTS: IRouteVariants = {
  isMobile: false,
  locale: DEFAULT_LANG,
  theme: 'light',
};

const SPLITTER = '__';

export class RouteVariants {
  static serializeVariants = (variants: IRouteVariants): string => {
    // Use compact format: locale_isMobile_theme
    // Example: "en-US_0_dark" represents English_Non-mobile_Dark theme
    return [variants.locale, Number(variants.isMobile), variants.theme].join(SPLITTER);
  };

  static deserializeVariants = (serialized: string): IRouteVariants => {
    try {
      const [locale, isMobile, theme] = serialized.split(SPLITTER);

      // Validate and return variant
      return {
        isMobile: isMobile === '1',
        locale: this.isValidLocale(locale) ? (locale as Locales) : DEFAULT_VARIANTS.locale,
        theme: this.isValidTheme(theme) ? theme : DEFAULT_VARIANTS.theme,
      };
    } catch {
      // Return default value on parse failure
      return { ...DEFAULT_VARIANTS };
    }
  };

  static getVariantsFromProps = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    return RouteVariants.deserializeVariants(variants);
  };

  static getIsMobile = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    const { isMobile } = RouteVariants.deserializeVariants(variants);
    return isMobile;
  };

  static getLocale = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    const { locale } = RouteVariants.deserializeVariants(variants);
    return locale;
  };

  // Utility function: create variant

  static createVariants = (options: Partial<IRouteVariants> = {}): IRouteVariants => ({
    ...DEFAULT_VARIANTS,
    ...options,
  });

  // Validation functions
  private static isValidLocale = (locale: string): boolean => locales.includes(locale as any);

  private static isValidTheme = (theme: string): boolean => SUPPORTED_THEMES.includes(theme as any);
}
