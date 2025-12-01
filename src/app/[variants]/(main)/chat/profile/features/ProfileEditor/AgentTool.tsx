'use client';

import { Avatar, Button, Icon, ItemType } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ArrowRight, PlusIcon, Store, ToyBrick } from 'lucide-react';
import React, { Suspense, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import { useStore } from '@/features/AgentSetting/store';
import ToolItem from '@/features/ChatInput/ActionBar/Tools/ToolItem';
import ActionDropdown from '@/features/ChatInput/ActionBar/components/ActionDropdown';
import PluginStore from '@/features/PluginStore';
import { useCheckPluginsIsInstalled } from '@/hooks/useCheckPluginsIsInstalled';
import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { useToolStore } from '@/store/tool';
import { builtinToolSelectors, pluginSelectors } from '@/store/tool/selectors';

import PluginTag from './PluginTag';

const AgentTool = memo(() => {
  const { t } = useTranslation('setting');
  const config = useStore((s) => s.config);
  const theme = useTheme();

  // Plugin state management
  const plugins = config?.plugins || [];

  const toggleAgentPlugin = useStore((s) => s.toggleAgentPlugin);
  const installedPluginList = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);
  const builtinList = useToolStore(builtinToolSelectors.metaList, isEqual);

  // Plugin store modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch plugins
  const [useFetchPluginStore] = useToolStore((s) => [s.useFetchPluginStore]);
  useFetchPluginStore();
  useFetchInstalledPlugins();
  useCheckPluginsIsInstalled(plugins);

  // Handle plugin remove via Tag close
  const handleRemovePlugin =
    (pluginId: string | { enabled: boolean; identifier: string; settings: Record<string, any> }) =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const identifier = typeof pluginId === 'string' ? pluginId : pluginId?.identifier;
      toggleAgentPlugin(identifier, false);
    };

  // Build dropdown menu items (adapted from useControls)
  const enablePluginCount = plugins.filter(
    (id) => !builtinList.some((b) => b.identifier === id),
  ).length;

  const menuItems: ItemType[] = useMemo(
    () => [
      {
        children: builtinList.map((item) => ({
          icon: <Avatar avatar={item.meta.avatar} size={20} style={{ flex: 'none' }} />,
          key: item.identifier,
          label: (
            <ToolItem
              checked={plugins.includes(item.identifier)}
              id={item.identifier}
              label={item.meta?.title}
              onUpdate={async () => {
                setUpdating(true);
                await toggleAgentPlugin(item.identifier);
                setUpdating(false);
              }}
            />
          ),
        })),
        key: 'builtins',
        label: t('tools.builtins.groupName'),
        type: 'group',
      },
      {
        children: installedPluginList.map((item) => ({
          icon: item?.avatar ? (
            <PluginAvatar avatar={item.avatar} size={20} />
          ) : (
            <Icon icon={ToyBrick} size={20} />
          ),
          key: item.identifier,
          label: (
            <ToolItem
              checked={plugins.includes(item.identifier)}
              id={item.identifier}
              label={item.title}
              onUpdate={async () => {
                setUpdating(true);
                await toggleAgentPlugin(item.identifier);
                setUpdating(false);
              }}
            />
          ),
        })),
        key: 'plugins',
        label: (
          <Flexbox align={'center'} gap={40} horizontal justify={'space-between'}>
            {t('tools.plugins.groupName')}
            {enablePluginCount === 0 ? null : (
              <div style={{ fontSize: 12, marginInlineEnd: 4 }}>
                {t('tools.plugins.enabled', { num: enablePluginCount })}
              </div>
            )}
          </Flexbox>
        ),
        type: 'group',
      },
      {
        type: 'divider',
      },
      {
        extra: <Icon icon={ArrowRight} />,
        icon: Store,
        key: 'plugin-store',
        label: t('tools.plugins.store'),
        onClick: () => {
          setModalOpen(true);
        },
      },
    ],
    [builtinList, installedPluginList, plugins, enablePluginCount, t, toggleAgentPlugin],
  );

  const button = (
    <Button
      icon={PlusIcon}
      loading={updating}
      size={'small'}
      style={{ color: theme.colorTextSecondary }}
      type={'text'}
    >
      {t('tools.add')}
    </Button>
  );

  return (
    <>
      {/* Plugin Selector and Tags */}
      <Flexbox align="center" gap={8} horizontal wrap={'wrap'}>
        {/* Second Row: Selected Plugins as Tags */}
        {plugins?.map((pluginId) => {
          return (
            <PluginTag key={pluginId} onRemove={handleRemovePlugin(pluginId)} pluginId={pluginId} />
          );
        })}
        {/* Plugin Selector Dropdown - Using Action component pattern */}

        <Suspense fallback={button}>
          <ActionDropdown
            maxHeight={500}
            maxWidth={480}
            menu={{ items: menuItems }}
            minWidth={320}
            placement={'bottomLeft'}
            trigger={['click']}
          >
            {button}
          </ActionDropdown>
        </Suspense>
      </Flexbox>

      {/* PluginStore Modal */}
      <PluginStore open={modalOpen} setOpen={setModalOpen} />
    </>
  );
});

export default AgentTool;
