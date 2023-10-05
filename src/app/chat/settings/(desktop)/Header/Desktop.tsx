import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { pathString } from '@/utils/url';

const Header = memo<{ children: ReactNode }>(({ children }) => {
  const { t } = useTranslation('setting');
  const router = useRouter();

  return (
    <ChatHeader
      left={<ChatHeaderTitle title={t('header.session')} />}
      onBackClick={() => router.push(pathString('/chat', { hash: location.hash }))}
      right={children}
      showBackButton
    />
  );
});

export default Header;
