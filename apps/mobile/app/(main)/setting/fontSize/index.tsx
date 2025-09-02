import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text } from 'react-native';

import Slider from '@/components/Slider';
import { FONT_SIZE_STANDARD, FONT_SIZE_LARGE, FONT_SIZE_SMALL } from '@/const/common';
import { useSettingStore } from '@/store/setting';
import { SettingItem, SettingGroup } from '../(components)';
import { useStyles } from '../styles';

export default function FontSizeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();

  const { fontSize, setFontSize } = useSettingStore();

  return (
    <ScrollView style={styles.container}>
      <SettingGroup>
        <SettingItem
          customContent={
            <Slider
              marks={{
                [FONT_SIZE_LARGE]: { label: <Text style={styles.fontSizeLarge}>A</Text> },
                [FONT_SIZE_SMALL]: { label: <Text style={styles.fontSizeSmall}>A</Text> },
                [FONT_SIZE_STANDARD]: {
                  label: (
                    <Text style={styles.fontSizeStandard}>
                      {t('fontSize.standard', { ns: 'setting' })}
                    </Text>
                  ),
                },
              }}
              max={FONT_SIZE_LARGE}
              min={FONT_SIZE_SMALL}
              onChangeComplete={setFontSize}
              step={1}
              value={fontSize}
            />
          }
          title={t('fontSize.title', { ns: 'setting' })}
        />
      </SettingGroup>
    </ScrollView>
  );
}
