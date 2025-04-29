import { Avatar, DropdownProps, Icon, ItemType } from '@lobehub/ui';
import { Checkbox } from 'antd';
import isEqual from 'fast-deep-equal';
import { ArrowRight, Store, ToyBrick } from 'lucide-react';
import { PropsWithChildren, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginStore from '@/features/PluginStore';
import PluginAvatar from '@/features/PluginStore/PluginItem/PluginAvatar';
import { useCheckPluginsIsInstalled } from '@/hooks/useCheckPluginsIsInstalled';
import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { useWorkspaceModal } from '@/hooks/useWorkspaceModal';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { builtinToolSelectors, pluginSelectors } from '@/store/tool/selectors';

import ActionDropdown from '../../components/ActionDropdown';
import ToolItem from './ToolItem';

const DropdownMenu = memo<PropsWithChildren<{ disabled?: boolean }>>(({ children, disabled }) => {
  const { t } = useTranslation('setting');
  const list = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);
  const { showDalle } = useServerConfigStore(featureFlagsSelectors);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [open, setOpen] = useWorkspaceModal();
  const [checked, togglePlugin] = useAgentStore((s) => [
    agentSelectors.currentAgentPlugins(s),
    s.togglePlugin,
  ]);
  const builtinList = useToolStore(builtinToolSelectors.metaList(showDalle), isEqual);
  const enablePluginCount = useAgentStore(
    (s) =>
      agentSelectors
        .currentAgentPlugins(s)
        .filter((i) => !builtinList.some((b) => b.identifier === i)).length,
  );

  const items: ItemType[] = [
    {
      children: builtinList.map((item) => ({
        extra: (
          <Checkbox
            checked={checked.includes(item.identifier)}
            onClick={(e) => {
              e.stopPropagation();
              togglePlugin(item.identifier);
            }}
          />
        ),
        icon: <Avatar avatar={item.meta.avatar} size={20} style={{ flex: 'none' }} />,
        key: item.identifier,
        label: <ToolItem identifier={item.identifier} label={item.meta?.title} />,
        onClick: () => togglePlugin(item.identifier),
      })),

      key: 'builtins',
      label: t('tools.builtins.groupName'),
      type: 'group',
    },
    {
      children: list.map((item) => ({
        extra: (
          <Checkbox
            checked={checked.includes(item.identifier)}
            onClick={(e) => {
              e.stopPropagation();
              togglePlugin(item.identifier);
            }}
          />
        ),
        icon: item.meta?.avatar ? (
          <PluginAvatar avatar={pluginHelpers.getPluginAvatar(item.meta)} size={20} />
        ) : (
          <Icon icon={ToyBrick} size={20} />
        ),
        key: item.identifier,
        label: (
          <ToolItem identifier={item.identifier} label={pluginHelpers.getPluginTitle(item?.meta)} />
        ),
        onClick: () => togglePlugin(item.identifier),
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
        setDropdownOpen(false);
        setOpen(true);
      },
    },
  ];

  const plugins = useAgentStore((s) => agentSelectors.currentAgentPlugins(s));

  const [useFetchPluginStore] = useToolStore((s) => [s.useFetchPluginStore]);

  useFetchPluginStore();
  useFetchInstalledPlugins();
  useCheckPluginsIsInstalled(plugins);

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setDropdownOpen(nextOpen);
    }
  };

  return (
    <>
      <ActionDropdown
        disabled={disabled}
        maxHeight={500}
        menu={{ items }}
        minWidth={240}
        onOpenChange={handleOpenChange}
        open={dropdownOpen}
      >
        {children}
      </ActionDropdown>
      <PluginStore open={open} setOpen={setOpen} />
    </>
  );
});

export default DropdownMenu;
