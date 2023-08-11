import {
  PrimaryColors,
  Swatches,
  findCustomThemeName,
  primaryColors,
  primaryColorsSwatches,
} from '@lobehub/ui';
import { memo } from 'react';

import { useSettings } from '@/store/settings';

const ThemeSwatchesPrimary = memo(() => {
  const [primaryColor, setSettings] = useSettings((s) => [s.settings.primaryColor, s.setSettings]);

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
