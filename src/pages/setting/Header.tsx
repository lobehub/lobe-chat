import { ChatHeader } from '@lobehub/ui';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import HeaderTitle from '@/components/HeaderTitle';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={<HeaderTitle title={t('header.global')} />}
      onBackClick={() => Router.back()}
      showBackButton
    />
  );
});

export default Header;
