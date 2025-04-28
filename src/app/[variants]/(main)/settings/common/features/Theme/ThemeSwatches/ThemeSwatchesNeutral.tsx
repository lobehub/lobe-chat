import { ColorSwatches, NeutralColors, findCustomThemeName, neutralColors } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

const ThemeSwatchesNeutral = memo(() => {
  const { t } = useTranslation('color');

  const [neutralColor, updateGeneralConfig] = useUserStore((s) => [
    userGeneralSettingsSelectors.neutralColor(s),
    s.updateGeneralConfig,
  ]);

  const handleSelect = (v: any) => {
    const name = findCustomThemeName('neutral', v) as NeutralColors;
    updateGeneralConfig({ neutralColor: name || '' });
  };

  return (
    <ColorSwatches
      colors={[
        {
          color: 'rgba(0, 0, 0, 0)',
          title: t('default'),
        },
        {
          color: neutralColors.mauve,
          title: t('mauve'),
        },
        {
          color: neutralColors.olive,
          title: t('olive'),
        },
        {
          color: neutralColors.sage,
          title: t('sage'),
        },
        {
          color: neutralColors.sand,
          title: t('sand'),
        },
        {
          color: neutralColors.slate,
          title: t('slate'),
        },
      ]}
      onChange={handleSelect}
      value={neutralColor ? neutralColors[neutralColor] : undefined}
    />
  );
});

export default ThemeSwatchesNeutral;
