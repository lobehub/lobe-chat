import { ListItem } from '@lobehub/ui-rn';
import { memo, useCallback, useMemo } from 'react';

import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

interface SessionItemProps {
  id: string;
}

const SessionItemComponent = ({ id }: SessionItemProps) => {
  const session = useSessionStore((s) => sessionSelectors.getSessionById(id)(s));
  const activeId = useSessionStore((s) => s.activeId);
  const switchSession = useSwitchSession();

  const isActive = activeId === id;

  const { title, description, avatar } = useMemo(() => {
    const meta = session.meta;
    return {
      avatar: sessionMetaSelectors.getAvatar(meta),
      description: sessionMetaSelectors.getDescription(meta),
      title: sessionMetaSelectors.getTitle(meta),
    };
  }, [session.meta]);

  const handlePress = useCallback(() => {
    // 使用 useSwitchSession hook，它会自动处理路由导航和抽屉关闭
    switchSession(id);
  }, [id, switchSession]);

  return (
    <ListItem
      active={isActive}
      avatar={avatar}
      description={description}
      onPress={handlePress}
      title={title}
    />
  );
};

const SessionItem = memo(SessionItemComponent);
SessionItem.displayName = 'SessionItem';

export default SessionItem;
