import { PageContainer, Slider } from '@lobehub/ui-rn';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/_const/common';
import { useSettingStore } from '@/store/setting';

import Preview from './components/Preview';
import { useStyles } from './styles';

export default function FontSizeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();

  const { fontSize, setFontSize } = useSettingStore();

  return (
    <PageContainer showBack title={t('fontSize.title', { ns: 'setting' })}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        style={styles.container}
      >
        <Preview />
      </ScrollView>
      <View style={styles.bottomBarWrapper}>
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
        <View style={styles.fontSizeContainer}>
          <Text style={styles.fontSizeText}>{t('fontSize.text', { ns: 'setting' })}</Text>
        </View>
      </View>
    </PageContainer>
  );
}
