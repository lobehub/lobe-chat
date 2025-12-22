import { ActionIcon, Flexbox, Text } from '@lobehub/ui';
import { Popover, type PopoverProps } from 'antd';
import { Languages } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Menu, { type MenuProps } from '@/components/Menu';
import { localeOptions } from '@/locales/resources';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { LocaleMode } from '@/types/locale';

const LangButton = memo<{ placement?: PopoverProps['placement']; size?: number }>(
  ({ placement = 'right', size }) => {
    const [language, switchLocale] = useGlobalStore((s) => [
      globalGeneralSelectors.language(s),
      s.switchLocale,
    ]);

    const handleLangChange = (value: LocaleMode) => {
      switchLocale(value);
    };

    const { t } = useTranslation(['setting', 'common']);

    const items: MenuProps['items'] = useMemo(
      () => [
        {
          key: 'auto',
          label: (
            <Flexbox gap={4}>
              <Text style={{ lineHeight: 1.2 }}>{t('settingCommon.lang.autoMode')}</Text>
              <Text fontSize={12} style={{ lineHeight: 1.2 }} type={'secondary'}>
                {t(`lang.auto` as any, { ns: 'common' })}
              </Text>
            </Flexbox>
          ),
          onClick: () => handleLangChange('auto'),
        },
        ...localeOptions.map((item) => ({
          key: item.value,
          label: (
            <Flexbox gap={4} key={item.value}>
              <Text style={{ lineHeight: 1.2 }}>{item.label}</Text>
              <Text fontSize={12} style={{ lineHeight: 1.2 }} type={'secondary'}>
                {t(`lang.${item.value}` as any, { ns: 'common' })}
              </Text>
            </Flexbox>
          ),
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
          container: {
            maxHeight: 360,
            minWidth: 240,
            overflow: 'auto',
            padding: 0,
          },
        }}
        trigger={['click', 'hover']}
      >
        <ActionIcon icon={Languages} size={size || { blockSize: 32, size: 16 }} />
      </Popover>
    );
  },
);

export default LangButton;
