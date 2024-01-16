import { CollapseProps } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { preferenceSelectors, settingsSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { SessionDefaultGroup } from '@/types/session';

import Actions from '../SessionListContent/CollapseGroup/Actions';
import CollapseGroup from './CollapseGroup';
import Inbox from './Inbox';
import SessionList from './List';
import ConfigGroupModal from './Modals/ConfigGroupModal';
import RenameGroupModal from './Modals/RenameGroupModal';

const SessionListContent = memo(() => {
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [renameGroupModalOpen, setRenameGroupModalOpen] = useState(false);
  const [configGroupModalOpen, setConfigGroupModalOpen] = useState(false);
  const { t } = useTranslation('chat');
  const sessionCustomGroups = useGlobalStore(settingsSelectors.sessionCustomGroups, isEqual);
  const sessionList =
    useSessionStore(sessionSelectors.sessionList(sessionCustomGroups), isEqual) || {};
  const [sessionGroupKeys, updatePreference] = useGlobalStore((s) => [
    preferenceSelectors.sessionGroupKeys(s),
    s.updatePreference,
  ]);

  const items = useMemo(
    () =>
      [
        sessionList.pinnedList?.length > 0 && {
          children: <SessionList dataSource={sessionList.pinnedList} />,
          key: SessionDefaultGroup.Pinned,
          label: (
            <Actions
              id={SessionDefaultGroup.Pinned}
              openConfigModal={() => setConfigGroupModalOpen(true)}
              title={t('pin')}
            />
          ),
        },
        ...sessionCustomGroups.map(({ id, name }) => ({
          children: sessionList.customList[id] && (
            <SessionList dataSource={sessionList.customList[id]} />
          ),
          key: id,
          label: (
            <Actions
              id={id}
              onOpenChange={(isOpen) => isOpen && setActiveGroupId(id)}
              openConfigModal={() => setConfigGroupModalOpen(true)}
              openRenameModal={() => {
                setRenameGroupModalOpen(true);
              }}
              title={name}
            />
          ),
        })),
        {
          children: <SessionList dataSource={sessionList.defaultList} />,
          key: SessionDefaultGroup.Default,
          label: (
            <Actions
              id={SessionDefaultGroup.Default}
              openConfigModal={() => setConfigGroupModalOpen(true)}
              title={t('defaultList')}
            />
          ),
        },
      ].filter(Boolean) as CollapseProps['items'],
    [sessionCustomGroups, sessionList],
  );

  return (
    <>
      <Inbox />
      <CollapseGroup
        activeKey={sessionGroupKeys}
        items={items}
        onChange={(keys) => {
          const sessionGroupKeys = typeof keys === 'string' ? [keys] : keys;
          updatePreference({ sessionGroupKeys });
        }}
      />
      <RenameGroupModal
        id={activeGroupId}
        onCancel={() => setRenameGroupModalOpen(false)}
        open={renameGroupModalOpen}
      />
      <ConfigGroupModal
        onCancel={() => setConfigGroupModalOpen(false)}
        open={configGroupModalOpen}
      />
    </>
  );
});

export default SessionListContent;
