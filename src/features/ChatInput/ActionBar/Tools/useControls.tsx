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

  // 市场 tab 的 items
  const marketItems: ItemType[] = [
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

  // 已安装 tab 的 items - 只显示已安装的插件
  const installedPluginItems: ItemType[] = useMemo(() => {
    const installedItems: ItemType[] = [];

    // 已安装的 builtin 工具
    const enabledBuiltinItems = filteredBuiltinList
      .filter((item) => checked.includes(item.identifier))
      .map((item) => ({
        icon: <Avatar avatar={item.meta.avatar} size={20} style={{ flex: 'none' }} />,
        key: item.identifier,
        label: (
          <ToolItem
            checked={true}
            id={item.identifier}
            label={item.meta?.title}
            onUpdate={async () => {
              setUpdating(true);
              await togglePlugin(item.identifier);
              setUpdating(false);
            }}
          />
        ),
      }));

    // 已连接的 Klavis 服务器（放在 builtin 里面）
    const connectedKlavisItems = klavisServerItems.filter((item) =>
      checked.includes(item.key as string),
    );

    // 合并 builtin 和 Klavis
    const allBuiltinItems = [...enabledBuiltinItems, ...connectedKlavisItems];

    if (allBuiltinItems.length > 0) {
      installedItems.push({
        children: allBuiltinItems,
        key: 'installed-builtins',
        label: t('tools.builtins.groupName'),
        type: 'group',
      });
    }

    // 已安装的插件
    const installedPlugins = list
      .filter((item) => checked.includes(item.identifier))
      .map((item) => ({
        icon: item?.avatar ? (
          <PluginAvatar avatar={item.avatar} size={20} />
        ) : (
          <Icon icon={ToyBrick} size={20} />
        ),
        key: item.identifier,
        label: (
          <ToolItem
            checked={true}
            id={item.identifier}
            label={item.title}
            onUpdate={async () => {
              setUpdating(true);
              await togglePlugin(item.identifier);
              setUpdating(false);
            }}
          />
        ),
      }));

    if (installedPlugins.length > 0) {
      installedItems.push({
        children: installedPlugins,
        key: 'installed-plugins',
        label: t('tools.plugins.groupName'),
        type: 'group',
      });
    }

    return installedItems;
  }, [filteredBuiltinList, list, klavisServerItems, checked, togglePlugin, setUpdating, t]);

  return { installedPluginItems, marketItems };
};
