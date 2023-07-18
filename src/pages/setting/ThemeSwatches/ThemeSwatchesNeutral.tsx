import {
  NeutralColors,
  Swatches,
  findCustomThemeName,
  neutralColors,
  neutralColorsSwatches,
} from '@lobehub/ui';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { useSettings } from '@/store/settings';

const ThemeSwatchesNeutral = memo(() => {
  const { neutralColor, setSettings } = useSettings(
    (s) => ({ neutralColor: s.settings.neutralColor, setSettings: s.setSettings }),
    shallow,
  );

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
