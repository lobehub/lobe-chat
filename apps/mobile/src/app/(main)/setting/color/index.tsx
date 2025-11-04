import {
  ColorSwatches,
  Flexbox,
  NeutralColors,
  PageContainer,
  PrimaryColors,
  findCustomThemeName,
  neutralColors,
  primaryColors,
} from '@lobehub/ui-rn';
import { LinearGradient } from 'expo-linear-gradient';
import { darken } from 'polished';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import SettingItem from '@/features/SettingItem';
import { useSettingStore } from '@/store/setting';

import Preview from './_features/Preview';
import { useStyles } from './_features/styles';

export default function ThemeSettingScreen() {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('setting');

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
    <LinearGradient
      colors={[
        theme.colorBgContainerSecondary,
        darken(0.04, theme.colorBgLayout),
        darken(0.04, theme.colorBgLayout),
      ]}
      locations={[0.2, 1]}
      style={{ flex: 1 }}
    >
      <PageContainer showBack title={t('color.title', { ns: 'setting' })}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          style={styles.container}
        >
          <Preview />
        </ScrollView>
        <Flexbox
          gap={16}
          glass
          paddingBlock={16}
          paddingInline={16}
          style={styles.bottomBarWrapper}
        >
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
                value={
                  primaryColor && primaryColor !== 'primary'
                    ? primaryColors[primaryColor]
                    : undefined
                }
              />
            }
            paddingInline={0}
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
            paddingInline={0}
            title={t('color.neutral.title', { ns: 'setting' })}
          />
        </Flexbox>
      </PageContainer>
    </LinearGradient>
  );
}
