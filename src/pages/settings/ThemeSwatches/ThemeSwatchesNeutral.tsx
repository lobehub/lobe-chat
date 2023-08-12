import {
  NeutralColors,
  Swatches,
  findCustomThemeName,
  neutralColors,
  neutralColorsSwatches,
} from '@lobehub/ui';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';

const ThemeSwatchesNeutral = memo(() => {
  const [neutralColor, setSettings] = useGlobalStore((s) => [
    s.settings.neutralColor,
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
