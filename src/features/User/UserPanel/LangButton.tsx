import { ActionIcon } from '@lobehub/ui';
import { Popover, type PopoverProps } from 'antd';
import { Languages } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Menu, { type MenuProps } from '@/components/Menu';
import { localeOptions } from '@/locales/resources';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { LocaleMode } from '@/types/locale';

const LangButton = memo<{ placement?: PopoverProps['placement'] }>(({ placement = 'right' }) => {
  const [language, switchLocale] = useGlobalStore((s) => [
    globalGeneralSelectors.language(s),
    s.switchLocale,
  ]);

  const handleLangChange = (value: LocaleMode) => {
    switchLocale(value);
  };

  const { t } = useTranslation('setting');

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'auto',
        label: t('settingCommon.lang.autoMode'),
        onClick: () => handleLangChange('auto'),
      },
      ...localeOptions.map((item) => ({
        key: item.value,
        label: item.label,
        onClick: () => handleLangChange(item.value),
      })),
    ],
    [t],
  );

  return (
    <Popover
      arrow={false}
      content={<Menu items={items} selectable selectedKeys={[language]} />}
      placement={placement}
      styles={{
        body: {
          maxHeight: 360,
          overflow: 'auto',
          padding: 0,
        },
      }}
      trigger={['click', 'hover']}
    >
      <ActionIcon icon={Languages} size={{ blockSize: 32, size: 16 }} />
    </Popover>
  );
});

export default LangButton;
