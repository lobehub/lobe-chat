import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text } from 'react-native';

import { ColorSwatches } from '@/components';
import Slider from '@/components/Slider';
import { useSettingStore } from '@/store/setting';
import {
  findCustomThemeName,
  PrimaryColors,
  NeutralColors,
  primaryColors,
  neutralColors,
} from '@/theme';
import { useStyles } from '../styles';
import { SettingItem, SettingGroup } from '../(components)';
import { FONT_SIZE_STANDARD, FONT_SIZE_LARGE, FONT_SIZE_SMALL } from '@/const/common';
import Preview from './(components)/Preview';

export default function ThemeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();

  const { primaryColor, neutralColor, setPrimaryColor, setNeutralColor, fontSize, setFontSize } =
    useSettingStore();

  const primaryColorSwatchesData = [
    { color: 'rgba(0, 0, 0, 0)', title: 'Default' },
    { color: primaryColors.red, title: 'Red' },
    { color: primaryColors.orange, title: 'Orange' },
    { color: primaryColors.gold, title: 'Gold' },
    { color: primaryColors.yellow, title: 'Yellow' },
    { color: primaryColors.lime, title: 'Lime' },
    { color: primaryColors.green, title: 'Green' },
    { color: primaryColors.cyan, title: 'Cyan' },
    { color: primaryColors.blue, title: 'Blue' },
    { color: primaryColors.geekblue, title: 'Geekblue' },
    { color: primaryColors.purple, title: 'Purple' },
    { color: primaryColors.magenta, title: 'Magenta' },
    { color: primaryColors.volcano, title: 'Volcano' },
  ];

  const neutralColorSwatchesData = [
    { color: 'rgba(0, 0, 0, 0)', title: 'Default' },
    { color: neutralColors.mauve, title: 'Mauve' },
    { color: neutralColors.slate, title: 'Slate' },
    { color: neutralColors.sage, title: 'Sage' },
    { color: neutralColors.olive, title: 'Olive' },
    { color: neutralColors.sand, title: 'Sand' },
  ];

  return (
    <ScrollView style={styles.container}>
      <SettingGroup>
        <SettingItem customContent={<Preview />} title={t('color.preview', { ns: 'setting' })} />
        <SettingItem
          customContent={
            <ColorSwatches
              colors={primaryColorSwatchesData}
              gap={8}
              onChange={(color: any) => {
                const name = findCustomThemeName('primary', color) as PrimaryColors;
                setPrimaryColor(name || '');
              }}
              size={32}
              value={primaryColor ? primaryColors[primaryColor] : undefined}
            />
          }
          title={t('color.primary.title', { ns: 'setting' })}
        />
        <SettingItem
          customContent={
            <ColorSwatches
              colors={neutralColorSwatchesData}
              gap={8}
              onChange={(color: any) => {
                const name = findCustomThemeName('neutral', color) as NeutralColors;
                setNeutralColor(name || '');
              }}
              size={32}
              value={neutralColor ? neutralColors[neutralColor] : undefined}
            />
          }
          title={t('color.neutral.title', { ns: 'setting' })}
        />
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
