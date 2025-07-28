'use client';

import { Button, Icon } from '@lobehub/ui';
import { Result, Table } from 'antd';
import { createStyles } from 'antd-style';
import { CheckCircle } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ token, css }) => {
  return {
    zeroCell: css`
      color: ${token.colorTextQuaternary};
    `,
  };
});

interface SuccessResultProps {
  dataSource?: {
    added: number;
    error: number;
    skips: number;
    title: string;
    updated: number;
  }[];
  duration: number;
  onClickFinish?: () => void;
}

const SuccessResult = memo<SuccessResultProps>(({ duration, dataSource, onClickFinish }) => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  const cellRender = (text: string) => {
    return text ? text : <span className={styles.zeroCell}>0</span>;
  };
  return (
    <Result
      extra={
        <Button onClick={onClickFinish} size={'large'} type={'primary'}>
          {t('importModal.finish.start')}
        </Button>
      }
      icon={<Icon icon={CheckCircle} />}
      status={'success'}
      style={{ paddingBlock: 24, paddingInline: 0 }}
      subTitle={
        // if there is no importData, means it's only import the settings
        !dataSource ? (
          t('importModal.finish.onlySettings')
        ) : (
          <Flexbox gap={16} width={500}>
            {t('importModal.finish.subTitle', { duration: (duration / 1000).toFixed(2) })}
            <Table
              bordered
              columns={[
                { dataIndex: 'title', render: cellRender, title: t('importModal.result.type') },
                { dataIndex: 'added', render: cellRender, title: t('importModal.result.added') },
                { dataIndex: 'skips', render: cellRender, title: t('importModal.result.skips') },
                { dataIndex: 'error', render: cellRender, title: t('importModal.result.errors') },
                { dataIndex: 'updated', render: cellRender, title: t('importModal.result.update') },
              ]}
              dataSource={dataSource}
              pagination={false}
              rowKey={'title'}
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
