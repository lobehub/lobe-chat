import React from 'react';
import { ScrollView } from 'react-native';

import { useLocale } from '@/hooks/useLocale';
import { LANGUAGE_OPTIONS, LocaleMode } from '@/i18n/resource';
import { useTranslation } from 'react-i18next';

import { SettingItem, SettingGroup } from '../(components)';
import { useStyles } from './styles';
import { Header } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LocaleScreen() {
  const { styles } = useStyles();
  const { localeMode, changeLocale } = useLocale();
  const { t } = useTranslation(['setting']);

  const handleLocaleChange = async (locale: LocaleMode) => {
    await changeLocale(locale);
  };

  const localeOptions = [
    { label: t('locale.auto.title', { ns: 'setting' }), value: 'auto' },
    ...LANGUAGE_OPTIONS,
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title={t('locale.title', { ns: 'setting' })} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <SettingGroup>
          {localeOptions.map((option, index) => (
            <SettingItem
              description={
                option.value === 'auto' ? t('locale.auto.description', { ns: 'setting' }) : ''
              }
              isLast={index === localeOptions.length - 1}
              isSelected={localeMode === option.value}
              key={option.value}
              onPress={() => handleLocaleChange(option.value as LocaleMode)}
              showCheckmark={true}
              title={option.label}
            />
          ))}
        </SettingGroup>
      </ScrollView>
    </SafeAreaView>
  );
}
