import { ActionIcon, Dropdown, Icon, Tag } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Loader2, MessageSquareDashed, Star } from 'lucide-react';
import qs from 'query-string';
import { MouseEvent, memo, useCallback, useMemo } from 'react';
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
    s.topicRenamingId === id,
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

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (editing) return;

      // Ctrl/Cmd+点击在新窗口打开
      if (e.button === 0 && (e.metaKey || e.ctrlKey) && id) {
        const topicUrl = qs.stringifyUrl({
          query: { session: activeSessionId, topic: id },
          url: '/chat',
        });
        window.open(topicUrl, '_blank');
        return;
      }

      toggleTopic(id);
      toggleConfig(false);
    },
    [editing, id, activeSessionId, toggleTopic, toggleConfig],
  );

  const handleDoubleClick = useCallback(() => {
    if (!id) return;
    if (isDesktop) {
      openTopicInNewWindow(activeSessionId, id);
    }
  }, [id, activeSessionId, openTopicInNewWindow]);

  // Favorite icon
  const favoriteIcon = useMemo(
    () =>
      id ? (
        <ActionIcon
          color={fav && !isLoading ? theme.colorWarning : undefined}
          fill={fav && !isLoading ? theme.colorWarning : 'transparent'}
          icon={isLoading ? Loader2 : Star}
          onClick={(e) => {
            e.stopPropagation();
            favoriteTopic(id, !fav);
          }}
          size={'small'}
          spin={isLoading}
        />
      ) : undefined,
    [id, fav, isLoading, theme, favoriteTopic],
  );

  const dropdownMenu = useTopicItemDropdownMenu({
    id,
    toggleEditing,
  });

  // For default topic (no id)
  if (!id) {
    return (
      <NavItem
        icon={<Icon color={theme.colorTextDescription} icon={MessageSquareDashed} size={'small'} />}
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
          icon={favoriteIcon}
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
