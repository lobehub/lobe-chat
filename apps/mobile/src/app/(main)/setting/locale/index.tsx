import { PageContainer } from '@lobehub/ui-rn';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import SettingGroup from '@/features/SettingGroup';
import SettingItem from '@/features/SettingItem';
import { useLocale } from '@/hooks/useLocale';
import i18n from '@/i18n';
import {
  LANGUAGE_FALLBACK_DISPLAY_NAMES,
  LANGUAGE_FALLBACK_NAMES,
  LANGUAGE_OPTIONS,
  LocaleMode,
  Locales,
  normalizeLocale,
} from '@/i18n/resource';

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
  const { localeMode, changeLocale } = useLocale();
  const { t } = useTranslation(['setting']);
  const [pendingLocale, setPendingLocale] = useState<LocaleMode | null>(null);

  const handleLocaleChange = async (locale: LocaleMode) => {
    if (pendingLocale || localeMode === locale) return;
    try {
      setPendingLocale(locale);
      await changeLocale(locale);
    } finally {
      setPendingLocale(null);
    }
  };

  const normalizedLocale = useMemo(
    () => normalizeLocale(i18n.language ?? '') as Locales,
    [i18n.language],
  );

  const localeOptions = [
    { label: t('locale.auto.title', { ns: 'setting' }), value: 'auto' },
    ...LANGUAGE_OPTIONS,
  ];

  const fallbackNames = LANGUAGE_FALLBACK_DISPLAY_NAMES[normalizedLocale];
  const currentDisplayNames = useMemo(
    () => createDisplayNames(normalizedLocale),
    [normalizedLocale],
  );
  const getDescription = useCallback(
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
      <ScrollView>
        <SettingGroup>
          {localeOptions.map((option) => (
            <SettingItem
              description={getDescription(option)}
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
