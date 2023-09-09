import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const Index = memo(() => {
  const { t } = useTranslation('setting');
  const [switchBackToChat] = useSessionStore((s) => [s.switchBackToChat]);

  return (
    <ChatHeader
      left={<ChatHeaderTitle title={t('header.global')} />}
      onBackClick={switchBackToChat}
      showBackButton
    />
  );
});

export default Index;
