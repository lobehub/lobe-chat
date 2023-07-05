import translation from '@/i18n/lang/en_US';

export const resources = {
  translation,
} as const;

type TranslationKeys = keyof typeof translation;

export type Translation = {
  [key in TranslationKeys]: string;
};
