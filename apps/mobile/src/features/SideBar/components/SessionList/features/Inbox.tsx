import { Cell } from '@lobehub/ui-rn';
import Avatar from '@lobehub/ui-rn/Avatar';
import { useTranslation } from 'react-i18next';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';
import { DEFAULT_INBOX_AVATAR } from '@/_const/meta';
import { INBOX_SESSION_ID } from '@/_const/session';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useSessionStore } from '@/store/session';

const Inbox = () => {
  const { t } = useTranslation('chat');
  const switchSession = useSwitchSession();
  const activeId = useSessionStore((s) => s.activeId);

  const isActive = activeId === INBOX_SESSION_ID;

  const handlePress = () => {
    // 使用 useSwitchSession hook，它会自动处理路由导航和抽屉关闭
    switchSession(INBOX_SESSION_ID);
  };

  return (
    <Cell
      active={isActive}
      icon={<Avatar avatar={DEFAULT_INBOX_AVATAR} size={AVATAR_SIZE_MEDIUM} />}
      iconSize={AVATAR_SIZE_MEDIUM}
      onPress={handlePress}
      paddingBlock={10}
      showArrow={false}
      style={{
        paddingRight: 8,
      }}
      title={t('inbox.title', { ns: 'chat' })}
      variant={'filled'}
    />
  );
};

export default Inbox;
