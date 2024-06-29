'use client';

import { Icon } from '@lobehub/ui';
import { Button, Result, Table } from 'antd';
import { CheckCircle } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface SuccessResultProps {
  dataSource?: {
    added: number;
    error: number;
    skips: number;
    title: string;
  }[];
  duration: number;
  onClickFinish?: () => void;
}

const SuccessResult = memo<SuccessResultProps>(({ duration, dataSource, onClickFinish }) => {
  const { t } = useTranslation('common');

  return (
    <Result
      extra={
        <Button onClick={onClickFinish} size={'large'} type={'primary'}>
          {t('importModal.finish.start')}
        </Button>
      }
      icon={<Icon icon={CheckCircle} />}
      status={'success'}
      style={{ paddingBlock: 24 }}
      subTitle={
        // if there is no importData, means it's only import the settings
        !dataSource ? (
          t('importModal.finish.onlySettings')
        ) : (
          <Flexbox gap={16} width={400}>
            {t('importModal.finish.subTitle', { duration: (duration / 1000).toFixed(2) })}
            <Table
              bordered
              columns={[
                { dataIndex: 'title', title: t('importModal.result.type') },
                { dataIndex: 'added', title: t('importModal.result.added') },
                { dataIndex: 'skips', title: t('importModal.result.skips') },
                { dataIndex: 'error', title: t('importModal.result.errors') },
              ]}
              dataSource={dataSource}
              pagination={false}
              size={'small'}
            />
          </Flexbox>
        )
      }
      title={t('importModal.finish.title')}
    />
  );
});

export default SuccessResult;
