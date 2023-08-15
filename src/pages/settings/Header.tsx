import { ChatHeader, ChatHeaderTitle, Tag } from '@lobehub/ui';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import pkg from '@/../package.json';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={<ChatHeaderTitle tag={<Tag>{`v${pkg.version}`}</Tag>} title={t('header.global')} />}
      onBackClick={() => Router.back()}
      showBackButton
    />
  );
});

export default Header;
