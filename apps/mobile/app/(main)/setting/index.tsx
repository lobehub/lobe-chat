import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text } from 'react-native';
import { isDev } from '@/utils/env';

import { ColorSwatches } from '@/components';
import { useLocale } from '@/hooks/useLocale';
import { version } from '../../../package.json';
import {
  useTheme as useAppTheme,
  findCustomThemeName,
  PrimaryColors,
  NeutralColors,
  primaryColors,
  neutralColors,
} from '@/theme';
import { useStyles } from './styles';
import { useSettingStore } from '@/store/setting';
import Slider from '@/components/Slider';

import { SettingItem, SettingGroup } from './(components)';
import { FONT_SIZE_STANDARD, FONT_SIZE_LARGE, FONT_SIZE_SMALL } from '@/const/common';
import Preview from './Preview';

export default function SettingScreen() {
  const { t } = useTranslation(['setting', 'auth', 'common', 'error']);
  const { theme, setThemeMode } = useAppTheme();
  const { getLocaleDisplayName } = useLocale();

  // 颜色配置状态
  const { primaryColor, neutralColor, setPrimaryColor, setNeutralColor, fontSize, setFontSize } =
    useSettingStore();

  const { styles } = useStyles();

  const isFollowSystem = theme.mode === 'auto';

  // 主色配置数据
  const primaryColorSwatchesData = [
    {
      color: 'rgba(0, 0, 0, 0)',
      title: 'Default',
    },
    {
      color: primaryColors.red,
      title: 'Red',
    },
    {
      color: primaryColors.orange,
      title: 'Orange',
    },
    {
      color: primaryColors.gold,
      title: 'Gold',
    },
    {
      color: primaryColors.yellow,
      title: 'Yellow',
    },
    {
      color: primaryColors.lime,
      title: 'Lime',
    },
    {
      color: primaryColors.green,
      title: 'Green',
    },
    {
      color: primaryColors.cyan,
      title: 'Cyan',
    },
    {
      color: primaryColors.blue,
      title: 'Blue',
    },
    {
      color: primaryColors.geekblue,
      title: 'Geekblue',
    },
    {
      color: primaryColors.purple,
      title: 'Purple',
    },
    {
      color: primaryColors.magenta,
      title: 'Magenta',
    },
    {
      color: primaryColors.volcano,
      title: 'Volcano',
    },
  ];

  // 中性色配置数据
  const neutralColorSwatchesData = [
    {
      color: 'rgba(0, 0, 0, 0)',
      title: 'Default',
    },
    {
      color: neutralColors.mauve,
      title: 'Mauve',
    },
    {
      color: neutralColors.slate,
      title: 'Slate',
    },
    {
      color: neutralColors.sage,
      title: 'Sage',
    },
    {
      color: neutralColors.olive,
      title: 'Olive',
    },
    {
      color: neutralColors.sand,
      title: 'Sand',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Theme settings inline */}
      <SettingGroup>
        <SettingItem customContent={<Preview />} title={t('theme.preview', { ns: 'setting' })} />
        <SettingItem
          onSwitchChange={(enabled) => setThemeMode(enabled ? 'auto' : 'light')}
          showSwitch
          switchValue={isFollowSystem}
          title={t('theme.auto', { ns: 'setting' })}
        />
        {!isFollowSystem && (
          <>
            <SettingItem
              isSelected={theme.mode === 'light'}
              onPress={() => setThemeMode('light')}
              showCheckmark
              title={t('theme.light', { ns: 'setting' })}
            />
            <SettingItem
              isSelected={theme.mode === 'dark'}
              onPress={() => setThemeMode('dark')}
              showCheckmark
              title={t('theme.dark', { ns: 'setting' })}
            />
          </>
        )}

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
          title={t('theme.primaryColor.title', { ns: 'setting' })}
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
          title={t('theme.neutralColor.title', { ns: 'setting' })}
        />
        <SettingItem
          customContent={
            <Slider
              marks={{
                [FONT_SIZE_SMALL]: { label: <Text style={styles.fontSizeSmall}>A</Text> },
                [FONT_SIZE_STANDARD]: {
                  label: (
                    <Text style={styles.fontSizeStandard}>
                      {t('theme.fontSize.standard', { ns: 'setting' })}
                    </Text>
                  ),
                },
                // eslint-disable-next-line sort-keys-fix/sort-keys-fix
                [FONT_SIZE_LARGE]: { label: <Text style={styles.fontSizeLarge}>A</Text> },
              }}
              max={FONT_SIZE_LARGE}
              min={FONT_SIZE_SMALL}
              onChangeComplete={setFontSize}
              step={1}
              value={fontSize}
            />
          }
          title={t('theme.fontSize.title', { ns: 'setting' })}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingItem
          extra={getLocaleDisplayName()}
          href="/setting/locale"
          title={t('locale.title', { ns: 'setting' })}
        />
        <SettingItem href="/setting/account" title={t('account.title', { ns: 'setting' })} />
        <SettingItem href="/setting/providers" title={t('providers', { ns: 'setting' })} />
      </SettingGroup>

      {isDev && (
        <SettingGroup>
          <SettingItem href="/setting/developer" title={t('developer', { ns: 'setting' })} />
        </SettingGroup>
      )}

      <SettingGroup>
        <SettingItem
          href="https://lobehub.com/docs?utm_source=mobile"
          title={t('help', { ns: 'setting' })}
        />
        <SettingItem
          href="https://github.com/lobehub/lobe-chat/issues/new/choose"
          title={t('feedback', { ns: 'setting' })}
        />
        <SettingItem
          href="https://lobehub.com/changelog"
          title={t('changelog', { ns: 'setting' })}
        />
        <SettingItem href="mailto:support@lobehub.com" title={t('support', { ns: 'setting' })} />
        <SettingItem extra={version} showNewBadge title={t('about', { ns: 'setting' })} />
      </SettingGroup>
    </ScrollView>
  );
}
