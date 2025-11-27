import { Command } from 'cmdk';
import { Monitor, Moon, Sun } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ThemeMode } from './types';

interface ThemeMenuProps {
  onThemeChange: (theme: ThemeMode) => void;
  styles: {
    icon: string;
    itemContent: string;
    itemLabel: string;
  };
}

const ThemeMenu = memo<ThemeMenuProps>(({ onThemeChange, styles }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Command.Item onSelect={() => onThemeChange('light')} value="theme-light">
        <Sun className={styles.icon} />
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{t('cmdk.themeLight')}</div>
        </div>
      </Command.Item>
      <Command.Item onSelect={() => onThemeChange('dark')} value="theme-dark">
        <Moon className={styles.icon} />
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{t('cmdk.themeDark')}</div>
        </div>
      </Command.Item>
      <Command.Item onSelect={() => onThemeChange('auto')} value="theme-auto">
        <Monitor className={styles.icon} />
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{t('cmdk.themeAuto')}</div>
        </div>
      </Command.Item>
    </>
  );
});

ThemeMenu.displayName = 'ThemeMenu';

export default ThemeMenu;
