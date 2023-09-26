import { ChatHeader, ChatHeaderTitle, Logo } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const Index = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ChatHeader
      left={<ChatHeaderTitle title={<Logo extra={t('header.global')} type={'text'} />} />}
    />
  );
});

export default Index;
