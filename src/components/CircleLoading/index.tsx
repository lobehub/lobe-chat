'use client';

import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

export default () => {
  const { t } = useTranslation('common');
  return (
    <Center height={'100%'} width={'100%'}>
      <Flexbox align={'center'} gap={8}>
        <div>
          <Icon icon={LoaderCircle} size={'large'} spin />
        </div>
        <Typography.Text type={'secondary'}>{t('loading')}</Typography.Text>
      </Flexbox>
    </Center>
  );
};
