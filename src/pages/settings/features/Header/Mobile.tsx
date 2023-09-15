import { MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <MobileNavBar
      center={<MobileNavBarTitle title={t('header.global')} />}
      onBackClick={() => Router.push('/chat')}
      showBackButton
    />
  );
});

export default Header;
