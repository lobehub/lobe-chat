import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import Slider from '@/components/Slider';
import { FONT_SIZE_STANDARD, FONT_SIZE_LARGE, FONT_SIZE_SMALL } from '@/const/common';
import { useSettingStore } from '@/store/setting';
import { useStyles } from './styles';
import Preview from './components/Preview';
import { Header } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FontSizeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();

  const { fontSize, setFontSize } = useSettingStore();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title={t('fontSize.title', { ns: 'setting' })} />
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
    </SafeAreaView>
  );
}
