import { type SidebarAgentItem } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import {
  useAgentList,
  useKeepSidebarListed,
} from '@/features/HomeSidebar/Body/Agent/List/useAgentList';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useHomeStore } from '@/store/home';
import { homeAgentListSelectors } from '@/store/home/selectors';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';
import { SessionDefaultGroup } from '@/types/session';

import CollapseGroup, { type CollapseGroupItem } from './CollapseGroup';
import Actions from './CollapseGroup/Actions';
import Inbox from './Inbox';
import SessionList from './List';
import ConfigGroupModal from './Modals/ConfigGroupModal';
import { openRenameGroupModal } from './Modals/RenameGroupModal';

const DefaultMode = memo(() => {
  const { t } = useTranslation('chat');

  const [configGroupModalOpen, setConfigGroupModalOpen] = useState(false);

  const isLogin = useUserStore(authSelectors.isLogin);
  const useFetchAgentList = useHomeStore((s) => s.useFetchAgentList);
  useFetchAgentList(isLogin);
  const isMobile = useServerConfigStore(serverConfigSelectors.isMobile);
  const { defaultList, pinnedList, customList, privateGroupList, privateUngroupedList } =
    useAgentList(false);
  const keep = useKeepSidebarListed();
  const privatePinned = useHomeStore(homeAgentListSelectors.privatePinnedAgents, isEqual);
  const filterItems = (items: SidebarAgentItem[]) =>
    isMobile ? items.filter((item) => item.type !== 'group') : items;
  const filteredDefaultSessions = filterItems([...defaultList, ...privateUngroupedList]);
  const filteredPinnedSessions = filterItems([...pinnedList, ...keep(privatePinned)]);
  const filteredCustomSessionGroups = [...customList, ...privateGroupList].map((group) => ({
    ...group,
    children: filterItems(group.items),
  }));

  const activeWorkspaceId = useActiveWorkspaceId();
  const sessionGroupKeys = useGlobalStore(
    systemStatusSelectors.sessionGroupKeys(activeWorkspaceId),
  );
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  const items = useMemo(
    () =>
      [
        filteredPinnedSessions &&
          filteredPinnedSessions.length > 0 && {
            children: <SessionList dataSource={filteredPinnedSessions} />,
            extra: <Actions isPinned openConfigModal={() => setConfigGroupModalOpen(true)} />,
            key: SessionDefaultGroup.Pinned,
            label: t('pin'),
          },
        ...(filteredCustomSessionGroups || []).map(({ id, name, children, visibility }) => ({
          children: <SessionList dataSource={children} groupId={id} visibility={visibility} />,
          extra: (
            <Actions
              isCustomGroup
              id={id}
              openConfigModal={() => setConfigGroupModalOpen(true)}
              openRenameModal={() => openRenameGroupModal(id)}
              visibility={visibility}
            />
          ),
          key: id,
          label: name,
        })),
        {
          children: <SessionList dataSource={filteredDefaultSessions || []} groupId={null} />,
          extra: <Actions openConfigModal={() => setConfigGroupModalOpen(true)} />,
          key: SessionDefaultGroup.Default,
          label: t('defaultList'),
        },
      ].filter(Boolean) as CollapseGroupItem[],
    [t, filteredCustomSessionGroups, filteredPinnedSessions, filteredDefaultSessions],
  );

  return (
    <>
      <Inbox />
      <CollapseGroup
        activeKey={sessionGroupKeys}
        items={items}
        onChange={(expandSessionGroupKeys) => updateSystemStatus({ expandSessionGroupKeys })}
      />
      <ConfigGroupModal
        open={configGroupModalOpen}
        onCancel={() => setConfigGroupModalOpen(false)}
      />
    </>
  );
});

DefaultMode.displayName = 'SessionDefaultMode';

export default DefaultMode;
