import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import Router from 'next/router';
import { type ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

const Header = memo<{ children: ReactNode }>(({ children }) => {
  const { t } = useTranslation('setting');

  return (
    <MobileNavBar
      center={<MobileNavBarTitle title={t('header.session')} />}
      onBackClick={() => Router.push({ hash: location.hash, pathname: `/chat/mobile` })}
      right={children}
      showBackButton
    />
  );
});

export default Header;
