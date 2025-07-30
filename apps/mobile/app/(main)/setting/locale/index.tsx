import React from 'react';
import { ScrollView } from 'react-native';

import { ListGroup } from '@/mobile/components';
import { useLocale } from '@/mobile/hooks/useLocale';
import { LANGUAGE_OPTIONS, LocaleMode } from '@/mobile/i18n/resource';
import { useTranslation } from 'react-i18next';

import { SettingItem } from '../(components)';
import { useStyles } from './styles';

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
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
      <ListGroup>
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
      </ListGroup>
    </ScrollView>
  );
}
