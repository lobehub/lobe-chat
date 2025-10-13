import { PageContainer } from '@lobehub/ui-rn';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { useLocale } from '@/hooks/useLocale';
import {
  LANGUAGE_FALLBACK_DISPLAY_NAMES,
  LANGUAGE_FALLBACK_NAMES,
  LANGUAGE_OPTIONS,
  LocaleMode,
  Locales,
  normalizeLocale,
} from '@/i18n/resource';

import { SettingGroup, SettingItem } from '../(components)';
import { useStyles } from './styles';

const createDisplayNames = (locale: string) => {
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') return undefined;

  try {
    return new Intl.DisplayNames([locale], { type: 'language' });
  } catch {
    return undefined;
  }
};

const VARIANT_LOCALES = new Set<Locales>(['pt-BR', 'zh-CN', 'zh-TW']);

const sanitizeLanguageName = (value?: string | null) => {
  if (!value) return undefined;

  const sanitized = value
    .replace(/\s*\(.*?\)$/u, '')
    .replace(/\s*（.*?）$/u, '')
    .trim();

  return sanitized.length > 0 ? sanitized : undefined;
};

export default function LocaleScreen() {
  const { styles } = useStyles();
  const { localeMode, changeLocale } = useLocale();
  const { i18n, t } = useTranslation(['setting']);
  const [pendingLocale, setPendingLocale] = React.useState<LocaleMode | null>(null);

  const handleLocaleChange = async (locale: LocaleMode) => {
    if (pendingLocale || localeMode === locale) return;
    try {
      setPendingLocale(locale);
      await changeLocale(locale);
    } finally {
      setPendingLocale(null);
    }
  };

  const normalizedLocale = React.useMemo(
    () => normalizeLocale(i18n.language ?? '') as Locales,
    [i18n.language],
  );

  const localeOptions = [
    { label: t('locale.auto.title', { ns: 'setting' }), value: 'auto' },
    ...LANGUAGE_OPTIONS,
  ];

  const fallbackNames = LANGUAGE_FALLBACK_DISPLAY_NAMES[normalizedLocale];
  const currentDisplayNames = React.useMemo(
    () => createDisplayNames(normalizedLocale),
    [normalizedLocale],
  );
  const getDescription = React.useCallback(
    (option: (typeof localeOptions)[number]) => {
      if (option.value === 'auto') {
        return t('locale.auto.description', { ns: 'setting' });
      }
      const locale = option.value as Locales;

      const displayName = currentDisplayNames?.of(locale);
      const sanitized = sanitizeLanguageName(displayName);

      const baseCode = option.value.split('-')[0];
      const baseDisplayName =
        baseCode !== option.value ? currentDisplayNames?.of(baseCode) : undefined;
      const sanitizedBase = sanitizeLanguageName(baseDisplayName);

      let candidate = sanitized;

      if (sanitizedBase) {
        if (!candidate) {
          candidate = sanitizedBase;
        } else if (candidate !== sanitizedBase) {
          candidate = sanitizedBase;
        }
      }

      if (
        candidate &&
        VARIANT_LOCALES.has(locale) &&
        sanitizedBase &&
        candidate === sanitizedBase
      ) {
        candidate = undefined;
      }

      if (candidate) return candidate;

      const fallback = fallbackNames?.[locale];
      if (fallback) return fallback;

      return LANGUAGE_FALLBACK_NAMES[locale] ?? option.label;
    },
    [currentDisplayNames, fallbackNames, t],
  );

  return (
    <PageContainer showBack title={t('locale.title', { ns: 'setting' })}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <SettingGroup>
          {localeOptions.map((option, index) => (
            <SettingItem
              description={getDescription(option)}
              isLast={index === localeOptions.length - 1}
              isSelected={localeMode === option.value}
              key={option.value}
              loading={pendingLocale === (option.value as LocaleMode)}
              onPress={() => handleLocaleChange(option.value as LocaleMode)}
              showCheckmark={true}
              title={option.label}
            />
          ))}
        </SettingGroup>
      </ScrollView>
    </PageContainer>
  );
}
