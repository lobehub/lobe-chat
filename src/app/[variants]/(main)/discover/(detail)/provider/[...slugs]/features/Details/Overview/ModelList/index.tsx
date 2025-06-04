'use client';

import { ModelIcon } from '@lobehub/icons';
import { ActionIcon, Block, Tooltip } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import InlineTable from '@/components/InlineTable';
import { ModelInfoTags } from '@/components/ModelSelect';
import { formatPriceByCurrency, formatTokenNumber } from '@/utils/format';

import { useDetailContext } from '../../../DetailProvider';

const ModelList = memo(() => {
  const { models = [] } = useDetailContext();
  const { t } = useTranslation('discover');
  const theme = useTheme();

  return (
    <Block variant={'outlined'}>
      <InlineTable
        columns={[
          {
            dataIndex: 'id',
            key: 'model',
            render: (_, record) => {
              return (
                <Link href={urlJoin('/discover/model', record.id)} style={{ color: 'inherit' }}>
                  <Flexbox align="center" gap={8} horizontal>
                    <ModelIcon model={record.id} size={24} type={'avatar'} />
                    <Flexbox style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 500 }}>{record.displayName}</div>
                      <div style={{ color: theme.colorTextSecondary, fontSize: 12 }}>
                        {record.id}
                      </div>
                    </Flexbox>
                  </Flexbox>
                </Link>
              );
            },
            sorter: (a, b) => a.displayName.localeCompare(b.displayName),
            title: t('providers.modelName'),
            width: 200,
          },
          {
            dataIndex: 'abilities',
            key: 'abilities',
            render: (_, record) => {
              if (!record?.abilities || !Object.values(record?.abilities).includes(true))
                return '--';
              return <ModelInfoTags {...record?.abilities} />;
            },
            title: t('models.abilities'),
            width: 120,
          },
          {
            dataIndex: 'contextWindowTokens',
            key: 'contextLength',
            render: (_, record) =>
              record.contextWindowTokens ? formatTokenNumber(record.contextWindowTokens) : '--',
            sorter: (a, b) => (a.contextWindowTokens || 0) - (b.contextWindowTokens || 0),
            title: t('models.contentLength'),
            width: 120,
          },
          {
            dataIndex: 'maxOutput',
            key: 'maxOutput',
            render: (_, record) => (record.maxOutput ? formatTokenNumber(record.maxOutput) : '--'),
            sorter: (a, b) => (a.maxOutput || 0) - (b.maxOutput || 0),
            title: (
              <Tooltip title={t('models.providerInfo.maxOutputTooltip')}>
                {t('models.providerInfo.maxOutput')}
              </Tooltip>
            ),
            width: 120,
          },
          {
            dataIndex: 'inputPrice',
            key: 'inputPrice',
            render: (_, record) =>
              record.pricing?.input
                ? '$' + formatPriceByCurrency(record.pricing.input, record.pricing?.currency)
                : '--',
            sorter: (a, b) => (a.pricing?.input || 0) - (b.pricing?.input || 0),
            title: (
              <Tooltip title={t('models.providerInfo.inputTooltip')}>
                {t('models.providerInfo.input')}
              </Tooltip>
            ),
            width: 100,
          },
          {
            dataIndex: 'outputPrice',
            key: 'outputPrice',
            render: (_, record) =>
              record.pricing?.output
                ? '$' + formatPriceByCurrency(record.pricing.output, record.pricing?.currency)
                : '--',
            sorter: (a, b) => (a.pricing?.output || 0) - (b.pricing?.output || 0),
            title: (
              <Tooltip title={t('models.providerInfo.outputTooltip')}>
                {t('models.providerInfo.output')}
              </Tooltip>
            ),
            width: 100,
          },
          {
            align: 'right',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => {
              return (
                <Flexbox align="center" gap={4} horizontal justify={'flex-end'}>
                  <Link href={urlJoin('/discover/model', record.id)} style={{ color: 'inherit' }}>
                    <ActionIcon
                      color={theme.colorTextDescription}
                      icon={ChevronRightIcon}
                      size={'small'}
                      variant={'filled'}
                    />
                  </Link>
                </Flexbox>
              );
            },
            title: '',
            width: 60,
          },
        ]}
        dataSource={models}
        rowKey="id"
        scroll={{ x: 900 }}
      />
    </Block>
  );
});

export default ModelList;
