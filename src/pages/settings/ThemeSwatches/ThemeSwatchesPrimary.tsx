import {
  PrimaryColors,
  Swatches,
  findCustomThemeName,
  primaryColors,
  primaryColorsSwatches,
} from '@lobehub/ui';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { useSettings } from '@/store/settings';

const ThemeSwatchesPrimary = memo(() => {
  const { primaryColor, setSettings } = useSettings(
    (s) => ({ primaryColor: s.settings.primaryColor, setSettings: s.setSettings }),
    shallow,
  );

  const handleSelect = (v: any) => {
    const name = findCustomThemeName('primary', v) as PrimaryColors;
    setSettings({ primaryColor: name || '' });
  };

  return (
    <Swatches
      activeColor={primaryColor ? primaryColors[primaryColor] : undefined}
      colors={primaryColorsSwatches}
      onSelect={handleSelect}
    />
  );
});

export default ThemeSwatchesPrimary;
