import {
  NeutralColors,
  Swatches,
  findCustomThemeName,
  neutralColors,
  neutralColorsSwatches,
} from '@lobehub/ui';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

const ThemeSwatchesNeutral = memo(() => {
  const [neutralColor, setSettings] = useGlobalStore((s) => [
    settingsSelectors.currentSettings(s).neutralColor,
    s.setSettings,
  ]);

  const handleSelect = (v: any) => {
    const name = findCustomThemeName('neutral', v) as NeutralColors;
    setSettings({ neutralColor: name || '' });
  };

  return (
    <Swatches
      activeColor={neutralColor ? neutralColors[neutralColor] : undefined}
      colors={neutralColorsSwatches}
      onSelect={handleSelect}
    />
  );
});

export default ThemeSwatchesNeutral;
