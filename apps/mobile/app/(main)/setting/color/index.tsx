import { ColorSwatches, PageContainer } from '@lobehub/ui-rn';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useSettingStore } from '@/store/setting';
import {
  NeutralColors,
  PrimaryColors,
  findCustomThemeName,
  neutralColors,
  primaryColors,
} from '@/theme';

import { SettingGroup, SettingItem } from '../(components)';
import { useStyles } from '../styles';
import Preview from './(components)/Preview';

export default function ThemeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();

  const { primaryColor, neutralColor, setPrimaryColor, setNeutralColor } = useSettingStore();

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
    <PageContainer showBack title={t('color.title', { ns: 'setting' })}>
      <View style={styles.container}>
        <Preview />
        <SettingGroup style={{ marginTop: 16 }}>
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
        </SettingGroup>
      </View>
    </PageContainer>
  );
}
