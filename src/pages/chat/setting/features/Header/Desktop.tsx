import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const Header = memo<{ children: ReactNode }>(({ children }) => {
  const { t } = useTranslation('setting');
  const onBack = useSessionStore((s) => s.switchBackToChat);

  return (
    <ChatHeader
      left={<ChatHeaderTitle title={t('header.session')} />}
      onBackClick={onBack}
      right={children}
      showBackButton
    />
  );
});

export default Header;
