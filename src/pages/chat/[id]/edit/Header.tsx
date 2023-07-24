import { ActionIcon, ChatHeader } from '@lobehub/ui';
import { Download, Share2 } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import HeaderTitle from '@/components/HeaderTitle';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={<HeaderTitle title={t('header.session')} />}
      onBackClick={() => Router.back()}
      right={
        <>
          <ActionIcon icon={Share2} size={{ fontSize: 24 }} title={t('share', { ns: 'common' })} />
          <ActionIcon
            icon={Download}
            size={{ fontSize: 24 }}
            title={t('export', { ns: 'common' })}
          />
        </>
      }
      showBackButton
    />
  );
});

export default Header;
