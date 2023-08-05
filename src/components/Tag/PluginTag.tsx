import { Avatar } from '@lobehub/ui';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { PluginsMap } from '@/plugins';

import Tag from './index';

export interface PluginTagProps {
  plugins: string[];
}

const PluginTag = memo<PluginTagProps>(({ plugins }) => {
  const { t } = useTranslation('plugin');

  if (plugins.length === 0) return <Tag type={'plugin'}>{t(`plugins.${plugins[0]}` as any)}</Tag>;

  const items: MenuProps['items'] = plugins.map((id) => ({
    icon: (
      <Avatar avatar={PluginsMap[id].avatar} size={24} style={{ marginLeft: -6, marginRight: 2 }} />
    ),
    key: id,
    label: t(`plugins.${id}` as any),
  }));
  return (
    <Dropdown menu={{ items }}>
      <div style={{ height: 20 }}>
        <Tag count={plugins.length} type={'plugin'}>
          {t(`plugins.${plugins[0]}` as any)}
        </Tag>
      </div>
    </Dropdown>
  );
});

export default PluginTag;
