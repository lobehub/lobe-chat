import { Avatar, Icon, Tag } from '@lobehub/ui';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { LucideToyBrick } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { PluginsMap } from '@/plugins';

export interface PluginTagProps {
  plugins: string[];
}

const PluginTag = memo<PluginTagProps>(({ plugins }) => {
  const { t } = useTranslation('plugin');

  if (plugins.length === 0) return null;

  const items: MenuProps['items'] = plugins.map((id) => ({
    icon: (
      <Avatar avatar={PluginsMap[id].avatar} size={24} style={{ marginLeft: -6, marginRight: 2 }} />
    ),
    key: id,
    label: t(`plugins.${id}` as any),
  }));
  const count = plugins.length;

  return (
    <Dropdown menu={{ items }}>
      <div>
        <Tag>
          {<Icon icon={LucideToyBrick} />}
          {t(`plugins.${plugins[0]}` as any)}
          {count > 1 && <div>({plugins.length - 1}+)</div>}
        </Tag>
      </div>
    </Dropdown>
  );
});

export default PluginTag;
