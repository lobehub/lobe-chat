import { ColorSwatches, PrimaryColors, findCustomThemeName, primaryColors } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

const ThemeSwatchesPrimary = memo(() => {
  const { t } = useTranslation('color');
  const [primaryColor, updateGeneralConfig] = useUserStore((s) => [
    userGeneralSettingsSelectors.primaryColor(s),
    s.updateGeneralConfig,
  ]);

  const handleSelect = (v: any) => {
    const name = findCustomThemeName('primary', v) as PrimaryColors;
    updateGeneralConfig({ primaryColor: name || '' });
  };

  return (
    <ColorSwatches
      colors={[
        {
          color: 'rgba(0, 0, 0, 0)',
          title: t('default'),
        },
        {
          color: primaryColors.red,
          title: t('red'),
        },
        {
          color: primaryColors.orange,
          title: t('orange'),
        },
        {
          color: primaryColors.gold,
          title: t('gold'),
        },
        {
          color: primaryColors.yellow,
          title: t('yellow'),
        },
        {
          color: primaryColors.lime,
          title: t('lime'),
        },
        {
          color: primaryColors.green,
          title: t('green'),
        },
        {
          color: primaryColors.cyan,
          title: t('cyan'),
        },
        {
          color: primaryColors.blue,
          title: t('blue'),
        },
        {
          color: primaryColors.geekblue,
          title: t('geekblue'),
        },
        {
          color: primaryColors.purple,
          title: t('purple'),
        },
        {
          color: primaryColors.magenta,
          title: t('magenta'),
        },
        {
          color: primaryColors.volcano,
          title: t('volcano'),
        },
      ]}
      onChange={handleSelect}
      value={primaryColor ? primaryColors[primaryColor] : undefined}
    />
  );
});

export default ThemeSwatchesPrimary;
