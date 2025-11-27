'use client';

import { ActionIcon, Avatar, Icon, ItemType } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ArrowRight, Blocks, Settings, Store, ToyBrick } from 'lucide-react';
import React, { Suspense, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import { useStore } from '@/features/AgentSetting/store';
import ToolItem from '@/features/ChatInput/ActionBar/Tools/ToolItem';
import Action from '@/features/ChatInput/ActionBar/components/Action';
import ModelSelect from '@/features/ModelSelect';
import PluginStore from '@/features/PluginStore';
import { useCheckPluginsIsInstalled } from '@/hooks/useCheckPluginsIsInstalled';
import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { useToolStore } from '@/store/tool';
import { builtinToolSelectors, pluginSelectors } from '@/store/tool/selectors';

import PluginTag from './PluginTag';

interface AgentConfigBarProps {
  onOpenSettings: () => void;
}

/**
 * AgentConfigBar
 *
 * Primary configuration area featuring:
 * - Model selector (visual focus)
 * - Plugin selector with Tag display (using Tools component pattern)
 * - Settings button (opens legacy AgentSettings drawer)
 */
const AgentConfigBar = memo<AgentConfigBarProps>(({ onOpenSettings }) => {
  const { t } = useTranslation('setting');
  const theme = useTheme();

  const config = useStore((s) => s.config);

  const [modelValue, setModelValue] = useState({
    model: config.model,
    provider: config.provider,
  });
  const updateConfig = useStore((s) => s.setAgentConfig);

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

  const handleModelChange = useMemo(() => {
    return ({ model, provider }: { model: string; provider: string }) => {
      setModelValue({ model, provider });
      updateConfig({ model, provider });
    };
  }, [updateConfig]);

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

  return (
    <>
      <Flexbox direction="vertical" gap={18} paddingBlock={12} paddingInline={24}>
        {/* First Row: Model Selector */}
        <Flexbox align="center" direction="horizontal" gap={12}>
          {/* Label */}
          <Flexbox
            flex="none"
            style={{
              color: theme.colorTextSecondary,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {t('settingModel.model.title')}
          </Flexbox>

          {/* Model Selector */}
          <Flexbox flex={1} style={{ maxWidth: 400 }}>
            <ModelSelect onChange={handleModelChange} value={modelValue} />
          </Flexbox>

          {/* Plugin Selector Dropdown - Using Action component pattern */}
          <Suspense fallback={<ActionIcon disabled icon={Blocks} title={t('tools.title')} />}>
            <Action
              dropdown={{
                maxHeight: 500,
                maxWidth: 480,
                menu: { items: menuItems },
                minWidth: 320,
              }}
              icon={Blocks}
              loading={updating}
              showTooltip={false}
              title={t('tools.title')}
            />
          </Suspense>

          {/* Settings Button - Opens Legacy AgentSettings Drawer */}
          <ActionIcon icon={Settings} onClick={onOpenSettings} title="Advanced Settings" />
        </Flexbox>

        {/* Second Row: Selected Plugins as Tags */}
        {plugins?.length > 0 && (
          <Flexbox align="center" direction="horizontal" gap={8} style={{ flexWrap: 'wrap' }}>
            {plugins?.map((pluginId) => {
              return (
                <PluginTag
                  key={pluginId}
                  onRemove={handleRemovePlugin(pluginId)}
                  pluginId={pluginId}
                />
              );
            })}
          </Flexbox>
        )}
      </Flexbox>

      {/* PluginStore Modal */}
      <PluginStore open={modalOpen} setOpen={setModalOpen} />
    </>
  );
});

export default AgentConfigBar;
