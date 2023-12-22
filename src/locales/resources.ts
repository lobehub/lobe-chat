import resources from './default';

export const locales = [
  'de-DE',
  'en-US',
  'es-ES',
  'fr-FR',
  'ja-JP',
  'ko-KR',
  'pt-BR',
  'ru-RU',
  'tr-TR',
  'zh-CN',
  'zh-TW',
] as const;

export type DefaultResources = typeof resources;
export type Locales = (typeof locales)[number];
