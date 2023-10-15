import { CollapseProps } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import CollapseGroup from './CollapseGroup';
import Inbox from './Inbox';
import SessionList from './List';

const SessionListContent = memo(() => {
  const { t } = useTranslation('chat');
  const unpinnedSessionList = useSessionStore(sessionSelectors.unpinnedSessionList, isEqual);
  const pinnedList = useSessionStore(sessionSelectors.pinnedSessionList, isEqual);
  const hasPinnedSessionList = useSessionStore(sessionSelectors.hasPinnedSessionList);

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
      <CollapseGroup defaultActiveKey={['pinned', 'sessionList']} items={items} />
    </>
  );
});

export default SessionListContent;
