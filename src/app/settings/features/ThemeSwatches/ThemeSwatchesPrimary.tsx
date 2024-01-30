import {
  PrimaryColors,
  Swatches,
  findCustomThemeName,
  primaryColors,
  primaryColorsSwatches,
} from '@lobehub/ui';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

const ThemeSwatchesPrimary = memo(() => {
  const [primaryColor, setSettings] = useGlobalStore((s) => [
    settingsSelectors.currentSettings(s).primaryColor,
    s.setSettings,
  ]);

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
