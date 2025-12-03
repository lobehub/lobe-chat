import { Avatar, Icon, ItemType } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ArrowRight, Store, ToyBrick } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import { useCheckPluginsIsInstalled } from '@/hooks/useCheckPluginsIsInstalled';
import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useToolStore } from '@/store/tool';
import {
  builtinToolSelectors,
  klavisStoreSelectors,
  pluginSelectors,
} from '@/store/tool/selectors';

import KlavisServerItem from './KlavisServerItem';
import ToolItem from './ToolItem';

export const useControls = ({
  setModalOpen,
  setUpdating,
}: {
  setModalOpen: (open: boolean) => void;
  setUpdating: (updating: boolean) => void;
}) => {
  const { t } = useTranslation('setting');
  const list = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);
  const [checked, togglePlugin] = useAgentStore((s) => [
    agentSelectors.currentAgentPlugins(s),
    s.togglePlugin,
  ]);
  const builtinList = useToolStore(builtinToolSelectors.metaList, isEqual);
  const enablePluginCount = useAgentStore(
    (s) =>
      agentSelectors
        .currentAgentPlugins(s)
        .filter((i) => !builtinList.some((b) => b.identifier === i)).length,
  );
  const plugins = useAgentStore((s) => agentSelectors.currentAgentPlugins(s));

  // Klavis 相关状态
  const allKlavisServers = useToolStore(klavisStoreSelectors.getServers, isEqual);
  const isKlavisEnabledInEnv = klavisStoreSelectors.isKlavisEnabled();
  const loadUserKlavisServers = useToolStore((s) => s.loadUserKlavisServers);

  const [useFetchPluginStore] = useToolStore((s) => [s.useFetchPluginStore]);

  useFetchPluginStore();
  useFetchInstalledPlugins();
  useCheckPluginsIsInstalled(plugins);

  // 加载用户的 Klavis 集成（从数据库）
  useEffect(() => {
    if (isKlavisEnabledInEnv) {
      loadUserKlavisServers();
    }
  }, [isKlavisEnabledInEnv, loadUserKlavisServers]);

  // 可用的服务器类型
  const availableServerTypes = [
    { icon: '🐙', id: 'Github', label: 'GitHub' },
    { icon: '🦊', id: 'Gitlab', label: 'GitLab' },
    { icon: '📧', id: 'Gmail', label: 'Gmail' },
    { icon: '📐', id: 'Linear', label: 'Linear' },
    { icon: '🎫', id: 'Jira', label: 'Jira' },
  ];

  // 根据服务器名称获取已连接的服务器
  const getServerByName = (serverName: string) => {
    console.log("allKlavisServers", allKlavisServers);
    return allKlavisServers.find((server) => server.serverName === serverName);
  };

  const items: ItemType[] = [
    {
      children: builtinList.map((item) => ({
        icon: <Avatar avatar={item.meta.avatar} size={20} style={{ flex: 'none' }} />,
        key: item.identifier,
        label: (
          <ToolItem
            checked={checked.includes(item.identifier)}
            id={item.identifier}
            label={item.meta?.title}
            onUpdate={async () => {
              setUpdating(true);
              await togglePlugin(item.identifier);
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
      children: list.map((item) => ({
        icon: item?.avatar ? (
          <PluginAvatar avatar={item.avatar} size={20} />
        ) : (
          <Icon icon={ToyBrick} size={20} />
        ),
        key: item.identifier,
        label: (
          <ToolItem
            checked={checked.includes(item.identifier)}
            id={item.identifier}
            label={item.title}
            onUpdate={async () => {
              setUpdating(true);
              await togglePlugin(item.identifier);
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
    // Klavis 分组（仅在环境中启用 Klavis 时显示）
    ...(isKlavisEnabledInEnv
      ? [
        {
          children: availableServerTypes.map((type) => ({
            key: `klavis-server-${type.id}`,
            label: (
              <KlavisServerItem
                icon={type.icon}
                label={type.label}
                server={getServerByName(type.id)}
                type={type.id}
              />
            ),
          })),
          key: 'klavis',
          label: (
            <Flexbox align={'center'} gap={40} horizontal justify={'space-between'}>
              {t('tools.klavis.groupName', { defaultValue: 'Klavis Servers' })}
              {allKlavisServers.length > 0 && (
                <div style={{ fontSize: 12, marginInlineEnd: 4 }}>
                  {allKlavisServers.length}{' '}
                  {t('tools.klavis.connected', { defaultValue: 'connected' })}
                </div>
              )}
            </Flexbox>
          ),
          type: 'group',
        } as ItemType,
      ]
      : []),
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
  ];

  return items;
};
