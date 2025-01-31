import { Button } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import ErrorResult from '@/features/InitClientDB/ErrorResult';

const InitError = () => {
  const { t } = useTranslation('common');

  return (
    <ErrorResult>
      {({ setOpen }) => (
        <Center gap={8}>
          {t('appLoading.failed')}
          <div>
            <Button onClick={() => setOpen(true)} type={'primary'}>
              {t('appLoading.showDetail')}
            </Button>
          </div>
        </Center>
      )}
    </ErrorResult>
  );
};

export default InitError;
