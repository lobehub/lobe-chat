import { ActionIcon, Dropdown, Icon, Tag } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { MessageSquareDashed, Star } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';
import NavItem from '@/features/NavPanel/NavItem';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

import Actions from './Actions';
import Editing from './Editing';
import { useTopicItemDropdownMenu } from './useDropdownMenu';

interface TopicItemProps {
  active?: boolean;
  fav?: boolean;
  id?: string;
  threadId?: string;
  title: string;
}

const TopicItem = memo<TopicItemProps>(({ id, title, fav, active }) => {
  const { t } = useTranslation('topic');
  const theme = useTheme();
  const openTopicInNewWindow = useGlobalStore((s) => s.openTopicInNewWindow);
  const activeSessionId = useSessionStore((s) => s.activeId);

  const [toggleTopic, editing, isLoading] = useChatStore((s) => [
    s.switchTopic,
    id ? s.topicRenamingId === id : false,
    id ? s.topicLoadingIds.includes(id) : false,
  ]);

  const [favoriteTopic] = useChatStore((s) => [s.favoriteTopic]);

  const toggleEditing = useCallback(
    (visible?: boolean) => {
      useChatStore.setState({ topicRenamingId: visible && id ? id : '' });
    },
    [id],
  );

  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);

  const handleClick = useCallback(() => {
    if (editing) return;

    toggleTopic(id);
    toggleConfig(false);
  }, [editing, id, toggleTopic, toggleConfig]);

  const handleDoubleClick = useCallback(() => {
    if (!id) return;
    if (isDesktop) {
      openTopicInNewWindow(activeSessionId, id);
    }
  }, [id, activeSessionId, openTopicInNewWindow]);

  const dropdownMenu = useTopicItemDropdownMenu({
    id,
    toggleEditing,
  });

  // For default topic (no id)
  if (!id) {
    return (
      <NavItem
        active={active}
        icon={<Icon color={theme.colorTextDescription} icon={MessageSquareDashed} size={'small'} />}
        loading={isLoading}
        onClick={handleClick}
        title={
          <Flexbox align={'center'} flex={1} gap={4} horizontal>
            {t('defaultTitle')}
            <Tag size={'small'}>{t('temp')}</Tag>
          </Flexbox>
        }
      />
    );
  }

  return (
    <>
      <Dropdown
        menu={{
          items: dropdownMenu,
        }}
        trigger={['contextMenu']}
      >
        <NavItem
          actions={<Actions dropdownMenu={dropdownMenu} />}
          active={active}
          disabled={editing}
          icon={
            <ActionIcon
              color={fav ? theme.colorWarning : undefined}
              fill={fav ? theme.colorWarning : 'transparent'}
              icon={Star}
              onClick={(e) => {
                e.stopPropagation();
                favoriteTopic(id, !fav);
              }}
              size={'small'}
            />
          }
          loading={isLoading}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          title={title}
        />
      </Dropdown>
      <Editing id={id} title={title} toggleEditing={toggleEditing} />
    </>
  );
});

export default TopicItem;
