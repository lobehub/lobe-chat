import { ActionIcon, Avatar, Icon, Tag } from '@lobehub/ui';
import type { MenuProps } from 'antd';
import { Badge, Dropdown } from 'antd';
import isEqual from 'fast-deep-equal';
import { LucideRotateCw, LucideToyBrick } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { pluginHelpers, pluginSelectors, usePluginStore } from '@/store/plugin';

const PluginStatus = memo<{ id: string; title?: string }>(({ title, id }) => {
  const { t } = useTranslation('common');
  const status = usePluginStore(pluginSelectors.getPluginManifestLoadingStatus(id));

  const renderStatus = useMemo(() => {
    switch (status) {
      case 'loading': {
        return <Badge color={'blue'} status={'processing'} />;
      }
      case 'error': {
        return <ActionIcon icon={LucideRotateCw} size={'small'} title={t('retry')} />;
      }
      case 'success': {
        return <Badge status={status} />;
      }
    }
  }, [status]);

  return (
    <Flexbox gap={12} horizontal justify={'space-between'}>
      {title} {renderStatus}
    </Flexbox>
  );
});

export interface PluginTagProps {
  plugins: string[];
}

const PluginTag = memo<PluginTagProps>(({ plugins }) => {
  const list = usePluginStore(pluginSelectors.displayPluginList);
  const displayPlugin = usePluginStore(pluginSelectors.getPluginMetaById(plugins[0]), isEqual);

  if (plugins.length === 0) return null;

  const items: MenuProps['items'] = plugins.map((id) => {
    const item = list.find((i) => i.identifier === id);

    return {
      icon: <Avatar avatar={item?.avatar} size={24} style={{ marginLeft: -6, marginRight: 2 }} />,
      key: id,
      label: <PluginStatus id={id} title={item?.title} />,
    };
  });

  const count = plugins.length;

  return (
    <Dropdown menu={{ items }}>
      <div>
        <Tag>
          {<Icon icon={LucideToyBrick} />}
          {pluginHelpers.getPluginTitle(displayPlugin?.meta)}
          {count > 1 && <div>({plugins.length - 1}+)</div>}
        </Tag>
      </div>
    </Dropdown>
  );
});

export default PluginTag;
