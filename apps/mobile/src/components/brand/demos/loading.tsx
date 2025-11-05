import { BrandLoading, Center, Text } from '@lobehub/ui-rn';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation('auth');
  return (
    <Center flex={1} justify="center">
      <BrandLoading size={48} />
      <Text style={{ marginTop: 12 }} type={'secondary'}>
        {t('login.processing')}
      </Text>
    </Center>
  );
};
