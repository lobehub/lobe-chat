import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import Router from 'next/router';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

const Header = memo<{ children: ReactNode }>(({ children }) => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={<ChatHeaderTitle title={t('header.session')} />}
      onBackClick={() => Router.push({ hash: location.hash, pathname: `/chat` })}
      right={children}
      showBackButton
    />
  );
});

export default Header;
