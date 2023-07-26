import { ChatHeader } from '@lobehub/ui';
import { Tag } from 'antd';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { version } from '@/../package.json';
import HeaderTitle from '@/components/HeaderTitle';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={<HeaderTitle tag={<Tag>{`v${version}`}</Tag>} title={t('header.global')} />}
      onBackClick={() => Router.back()}
      showBackButton
    />
  );
});

export default Header;
