import * as Localization from 'expo-localization';

import { DEFAULT_LANG } from '@/mobile/const/locale';
import { getSupportedLocales } from './generatedConfig';

import resources from './default';

// 获取支持的语言列表并转换为 const 类型
export const locales = getSupportedLocales() as readonly string[];

export type DefaultResources = typeof resources;
export type NS = keyof DefaultResources;
export type Locales = (typeof locales)[number];

export type LocaleMode = 'auto' | Locales;

export const normalizeLocale = (locale: string) => {
  if (!locale) return DEFAULT_LANG;

  // 处理 React Native 特有的语言格式
  const normalizedLocale = locale.replace('_', '-');

  // 特殊语言处理
  if (normalizedLocale.startsWith('ar')) return 'ar';
  if (normalizedLocale.startsWith('fa')) return 'fa-IR';
  if (normalizedLocale.startsWith('cn')) return 'zh-CN';

  // 英文变体统一映射到 en-US
  if (normalizedLocale.startsWith('en')) return 'en-US';

  // 中文变体统一映射到 zh-CN
  if (normalizedLocale.startsWith('zh')) return 'zh-CN';

  // 其他语言的精确匹配
  for (const l of locales) {
    if (l.startsWith(normalizedLocale) || normalizedLocale.startsWith(l)) {
      return l;
    }
  }

  return DEFAULT_LANG;
};

export const getDetectedLocale = (): string => {
  const locale = Localization.getLocales()[0].languageTag;

  return normalizeLocale(locale);
};

type LocaleOptions = {
  label: string;
  value: Locales;
}[];

export const LANGUAGE_OPTIONS: LocaleOptions = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: '繁體中文',
    value: 'zh-TW',
  },
  {
    label: '日本語',
    value: 'ja-JP',
  },
  {
    label: '한국어',
    value: 'ko-KR',
  },
  {
    label: 'Deutsch',
    value: 'de-DE',
  },
  {
    label: 'Español',
    value: 'es-ES',
  },
  {
    label: 'العربية',
    value: 'ar',
  },
  {
    label: 'Français',
    value: 'fr-FR',
  },
  {
    label: 'Português',
    value: 'pt-BR',
  },
  {
    label: 'Русский',
    value: 'ru-RU',
  },
  {
    label: 'Türkçe',
    value: 'tr-TR',
  },
  {
    label: 'Polski',
    value: 'pl-PL',
  },
  {
    label: 'Nederlands',
    value: 'nl-NL',
  },
  {
    label: 'Italiano',
    value: 'it-IT',
  },
  {
    label: 'Tiếng Việt',
    value: 'vi-VN',
  },
  {
    label: 'Български',
    value: 'bg-BG',
  },
  {
    label: 'فارسی',
    value: 'fa-IR',
  },
] as LocaleOptions;

export const supportLocales: string[] = [...locales, 'en', 'zh'];
