import { useMemo } from 'react';

import { ListItem } from '@/components';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';
import { useGlobalStore } from '@/store/global';

interface SessionItemProps {
  id: string;
}

const SessionItem = ({ id }: SessionItemProps) => {
  const session = useSessionStore((s) => sessionSelectors.getSessionById(id)(s));
  const switchSession = useSessionStore((s) => s.switchSession);
  const setDrawerOpen = useGlobalStore((s) => s.setDrawerOpen);

  const { title, description, avatar } = useMemo(() => {
    const meta = session.meta;
    return {
      avatar: sessionMetaSelectors.getAvatar(meta),
      description: sessionMetaSelectors.getDescription(meta),
      title: sessionMetaSelectors.getTitle(meta),
    };
  }, [session.meta]);

  const handlePress = () => {
    switchSession(id);
    setDrawerOpen(false);
  };

  return (
    <ListItem
      avatar={avatar}
      description={description}
      href={`/chat?id=${id}`}
      onPress={handlePress}
      title={title}
    />
  );
};

export default SessionItem;
