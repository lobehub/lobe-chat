import { CollapseProps } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import CollapseGroup from './CollapseGroup';
import Inbox from './Inbox';
import SessionList from './List';

const SessionListContent = memo(() => {
  const { t } = useTranslation('chat');
  const unpinnedSessionList = useSessionStore(sessionSelectors.unpinnedSessionList, isEqual);
  const pinnedList = useSessionStore(sessionSelectors.pinnedSessionList, isEqual);
  const [hasPinnedSessionList, useFetchSessions] = useSessionStore((s) => [
    sessionSelectors.hasPinnedSessionList(s),
    s.useFetchSessions,
  ]);

  const [sessionGroupKeys, updatePreference] = useGlobalStore((s) => [
    preferenceSelectors.sessionGroupKeys(s),
    s.updatePreference,
  ]);

  useFetchSessions();

  const items = [
    hasPinnedSessionList && {
      children: <SessionList dataSource={pinnedList} />,
      key: 'pinned',
      label: t('pin'),
    },
    {
      children: <SessionList dataSource={unpinnedSessionList} />,
      key: 'sessionList',
      label: t('sessionList'),
    },
  ].filter(Boolean) as CollapseProps['items'];

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
    </>
  );
});

export default SessionListContent;
