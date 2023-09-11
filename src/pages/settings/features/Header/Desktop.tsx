import { ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const Index = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={<ChatHeaderTitle title={t('header.global')} />}
      onBackClick={() => Router.back()}
      showBackButton
    />
  );
});

export default Index;
