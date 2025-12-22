import { Command } from 'cmdk';
import { Monitor, Moon, Sun } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCommandMenu } from './useCommandMenu';
import { useStyles } from './styles';

const ThemeMenu = memo(() => {
  const { t } = useTranslation('common');
  const { handleThemeChange } = useCommandMenu();
  const { styles } = useStyles();

  return (
    <>
      <Command.Item onSelect={() => handleThemeChange('light')} value="theme-light">
        <Sun className={styles.icon} />
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{t('cmdk.themeLight')}</div>
        </div>
      </Command.Item>
      <Command.Item onSelect={() => handleThemeChange('dark')} value="theme-dark">
        <Moon className={styles.icon} />
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{t('cmdk.themeDark')}</div>
        </div>
      </Command.Item>
      <Command.Item onSelect={() => handleThemeChange('auto')} value="theme-auto">
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
