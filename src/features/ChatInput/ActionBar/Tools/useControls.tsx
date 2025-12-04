import { KLAVIS_SERVER_TYPES } from '@lobechat/const';
import { Avatar, Icon, ItemType } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ArrowRight, Store, ToyBrick } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
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

  // 根据服务器名称获取已连接的服务器
  const getServerByName = (serverName: string) => {
    return allKlavisServers.find((server) => server.serverName === serverName);
  };

  // 获取所有 Klavis 服务器的 identifier 集合
  const klavisServerIdentifiers = useToolStore(klavisStoreSelectors.getAllServerIdentifiers);

  // 过滤掉 builtinList 中的 klavis 工具（它们会单独显示）
  const filteredBuiltinList = useMemo(
    () => builtinList.filter((item) => !klavisServerIdentifiers.has(item.identifier)),
    [builtinList, klavisServerIdentifiers],
  );

  // Klavis 服务器列表项
  const klavisServerItems = useMemo(
    () =>
      isKlavisEnabledInEnv
        ? KLAVIS_SERVER_TYPES.map((type) => ({
            icon: (
              <Image
                alt={type.label}
                height={18}
                src={type.icon}
                style={{ flex: 'none' }}
                unoptimized
                width={18}
              />
            ),
            key: type.id,
            label: (
              <KlavisServerItem
                icon={type.icon}
                label={type.label}
                server={getServerByName(type.id)}
                type={type.id}
              />
            ),
          }))
        : [],
    [isKlavisEnabledInEnv, allKlavisServers],
  );

  // 合并 builtin 工具和 Klavis 服务器
  const builtinItems = useMemo(
    () => [
      // 原有的 builtin 工具
      ...filteredBuiltinList.map((item) => ({
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
      // Klavis 服务器
      ...klavisServerItems,
    ],
    [filteredBuiltinList, klavisServerItems, checked, togglePlugin, setUpdating],
  );

  const items: ItemType[] = [
    {
      children: builtinItems,
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
