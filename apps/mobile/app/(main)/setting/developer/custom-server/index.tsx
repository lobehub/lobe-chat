import { PageContainer } from '@lobehub/ui-rn';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CustomServer from '@/features/setting/developer/CustomServer';

const CustomServerScreen = () => {
  const { t } = useTranslation(['setting']);

  return (
    <PageContainer showBack title={t('developer.customServer.title', { ns: 'setting' })}>
      <CustomServer />
    </PageContainer>
  );
};

export default CustomServerScreen;
