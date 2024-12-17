import { Button } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import FailedModal from '@/features/InitClientDB/FailedModal';

const InitError = () => {
  const { t } = useTranslation('common');

  return (
    <FailedModal>
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
    </FailedModal>
  );
};

export default InitError;
