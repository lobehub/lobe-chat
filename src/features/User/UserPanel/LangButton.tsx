import { ActionIcon } from '@lobehub/ui';
import { Popover } from 'antd';
import { useTheme } from 'antd-style';
import { Languages } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Menu, { type MenuProps } from '@/components/Menu';
import { localeOptions } from '@/locales/resources';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { switchLang } from '@/utils/client/switchLang';

const LangButton = memo(() => {
  const theme = useTheme();
  const language = useUserStore((s) => settingsSelectors.currentSettings(s).language);

  const { t } = useTranslation('setting');

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'auto',
        label: t('settingTheme.lang.autoMode'),
        onClick: () => switchLang('auto'),
      },
      ...localeOptions.map((item) => ({
        key: item.value,
        label: item.label,
        onClick: () => switchLang(item.value),
      })),
    ],
    [t],
  );

  return (
    <Popover
      arrow={false}
      content={<Menu items={items} selectable selectedKeys={[language]} />}
      overlayInnerStyle={{
        padding: 0,
      }}
      placement={'right'}
      trigger={['click', 'hover']}
    >
      <ActionIcon
        icon={Languages}
        size={{ blockSize: 32, fontSize: 16 }}
        style={{ border: `1px solid ${theme.colorFillSecondary}` }}
      />
    </Popover>
  );
});

export default LangButton;
