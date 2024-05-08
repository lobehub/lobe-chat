import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Dropdown, MenuProps } from 'antd';
import { MoreHorizontal, Search, Trash } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SidebarHeader from '@/components/SidebarHeader';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

import TopicSearchBar from './TopicSearchBar';

const Header = memo(() => {
  const { t } = useTranslation('chat');
  const [topicLength, removeUnstarredTopic, removeAllTopic] = useChatStore((s) => [
    topicSelectors.currentTopicLength(s),
    s.removeUnstarredTopic,
    s.removeSessionTopics,
  ]);

  const [showSearch, setShowSearch] = useState(false);
  const { modal } = App.useApp();

  const items = useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={Trash} />,
        key: 'deleteUnstarred',
        label: t('topic.removeUnstarred'),
        onClick: () => {
          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: removeUnstarredTopic,
            title: t('topic.confirmRemoveUnstarred', { ns: 'chat' }),
          });
        },
      },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'deleteAll',
        label: t('topic.removeAll'),
        onClick: () => {
          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: removeAllTopic,
            title: t('topic.confirmRemoveAll', { ns: 'chat' }),
          });
        },
      },
    ],
    [],
  );

  return showSearch ? (
    <Flexbox padding={'12px 16px 4px'}>
      <TopicSearchBar onClear={() => setShowSearch(false)} />
    </Flexbox>
  ) : (
    <SidebarHeader
      actions={
        <>
          <ActionIcon icon={Search} onClick={() => setShowSearch(true)} size={'small'} />
          <Dropdown
            arrow={false}
            menu={{
              items: items,
              onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
              },
            }}
            trigger={['click']}
          >
            <ActionIcon icon={MoreHorizontal} size={'small'} />
          </Dropdown>
        </>
      }
      title={`${t('topic.title')} ${topicLength > 1 ? topicLength + 1 : ''}`}
    />
  );
});

export default Header;
