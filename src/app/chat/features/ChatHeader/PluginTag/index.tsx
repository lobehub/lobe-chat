import { Avatar, Icon, Tag } from '@lobehub/ui';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import isEqual from 'fast-deep-equal';
import { LucideToyBrick } from 'lucide-react';
import { memo } from 'react';

import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import PluginStatus from './PluginStatus';

export interface PluginTagProps {
  plugins: string[];
}

const PluginTag = memo<PluginTagProps>(({ plugins }) => {
  const list = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);
  const displayPlugin = useToolStore(pluginSelectors.getPluginMetaById(plugins[0]), isEqual);

  if (plugins.length === 0) return null;

  const items: MenuProps['items'] = plugins.map((id) => {
    const item = list.find((i) => i.identifier === id);
    const isDeprecated = !pluginHelpers.getPluginTitle(item?.meta);
    const avatar = isDeprecated ? '♻️' : pluginHelpers.getPluginAvatar(item?.meta);

    return {
      icon: <Avatar avatar={avatar} size={24} style={{ marginLeft: -6, marginRight: 2 }} />,
      key: id,
      label: (
        <PluginStatus
          deprecated={isDeprecated}
          id={id}
          title={pluginHelpers.getPluginTitle(item?.meta)}
        />
      ),
    };
  });

  const count = plugins.length;

  return (
    <Dropdown menu={{ items }}>
      <div>
        <Tag>
          {<Icon icon={LucideToyBrick} />}
          {pluginHelpers.getPluginTitle(displayPlugin) || plugins[0]}
          {count > 1 && <div>({plugins.length - 1}+)</div>}
        </Tag>
      </div>
    </Dropdown>
  );
});

export default PluginTag;
