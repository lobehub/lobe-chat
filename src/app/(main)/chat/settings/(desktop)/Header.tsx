import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import HeaderContent from '@/app/(main)/chat/settings/features/HeaderContent';
import { pathString } from '@/utils/url';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const router = useRouter();

  return (
    <ChatHeader
      left={<ChatHeaderTitle title={t('header.session')} />}
      onBackClick={() => router.push(pathString('/chat', { search: location.search }))}
      right={<HeaderContent />}
      showBackButton
    />
  );
});

export default Header;
