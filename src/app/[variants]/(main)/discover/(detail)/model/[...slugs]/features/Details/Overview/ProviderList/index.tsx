'use client';

import { ProviderIcon } from '@lobehub/icons';
import { ActionIcon, Block, Icon, Tooltip } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { BadgeCheck, BookIcon, ChevronRightIcon, KeyIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import InlineTable from '@/components/InlineTable';
import { ModelInfoTags } from '@/components/ModelSelect';
import { BASE_PROVIDER_DOC_URL } from '@/const/url';
import { formatPriceByCurrency, formatTokenNumber } from '@/utils/format';

import { useDetailContext } from '../../../DetailProvider';

const ProviderList = memo(() => {
  const { providers = [] } = useDetailContext();
  const { t } = useTranslation('discover');
  const theme = useTheme();

  return (
    <Block variant={'outlined'}>
      <InlineTable
        columns={[
          {
            dataIndex: 'id',
            key: 'provider',
            render: (_, record) => {
              return (
                <Link href={urlJoin('/discover/provider', record.id)} style={{ color: 'inherit' }}>
                  <Flexbox align="center" gap={8} horizontal>
                    <ProviderIcon provider={record.id} size={24} type={'avatar'} />
                    <div style={{ fontWeight: 500 }}>{record.name}</div>
                  </Flexbox>
                </Link>
              );
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
            title: t('tab.provider'),
            width: 200,
          },
          {
            dataIndex: 'model.abilities',
            key: 'abilities',
            render: (_, record) => {
              if (!record?.model?.abilities) return '--';
              return <ModelInfoTags {...record?.model?.abilities} />;
            },
            title: t('models.abilities'),
            width: 120,
          },
          {
            dataIndex: 'model.contextLength',
            key: 'contextLength',
            render: (_, record) =>
              record.model?.contextWindowTokens
                ? formatTokenNumber(record.model.contextWindowTokens)
                : '--',
            sorter: (a, b) =>
              (a.model?.contextWindowTokens || 0) - (b.model?.contextWindowTokens || 0),
            title: t('models.contentLength'),
            width: 120,
          },
          {
            dataIndex: 'model.maxOutput',
            key: 'maxOutput',
            render: (_, record) =>
              record.model?.maxOutput
                ? formatTokenNumber(record.model.maxOutput)
                : record.model?.maxDimension
                  ? formatTokenNumber(record.model.maxDimension)
                  : '--',
            sorter: (a, b) => {
              const aValue = a.model?.maxOutput || a.model?.maxDimension || 0;
              const bValue = b.model?.maxOutput || b.model?.maxDimension || 0;
              return aValue - bValue;
            },
            title: (
              <Tooltip title={t('models.providerInfo.maxOutputTooltip')}>
                {t('models.providerInfo.maxOutput')}
              </Tooltip>
            ),
            width: 120,
          },
          {
            dataIndex: 'model.inputPrice',
            key: 'inputPrice',
            render: (_, record) =>
              record.model?.pricing?.input
                ? '$' +
                  formatPriceByCurrency(record.model.pricing.input, record.model.pricing?.currency)
                : '--',
            sorter: (a, b) => (a.model?.pricing?.input || 0) - (b.model?.pricing?.input || 0),
            title: (
              <Tooltip title={t('models.providerInfo.inputTooltip')}>
                {t('models.providerInfo.input')}
              </Tooltip>
            ),
            width: 100,
          },
          {
            dataIndex: 'model.outputPrice',
            key: 'outputPrice',
            render: (_, record) =>
              record.model?.pricing?.output
                ? '$' +
                  formatPriceByCurrency(record.model.pricing.output, record.model.pricing?.currency)
                : '--',
            sorter: (a, b) => (a.model?.pricing?.output || 0) - (b.model?.pricing?.output || 0),
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
              const isLobeHub = record.id === 'lobehub';
              return (
                <Flexbox align="center" gap={4} horizontal justify={'flex-end'}>
                  {isLobeHub && (
                    <Tooltip title={t('models.providerInfo.officialTooltip')}>
                      <ActionIcon
                        color={theme.colorSuccess}
                        icon={BadgeCheck}
                        size={'small'}
                        variant={'filled'}
                      />
                    </Tooltip>
                  )}
                  {!isLobeHub && (
                    <Tooltip title={t('models.providerInfo.apiTooltip')}>
                      <ActionIcon
                        icon={<Icon icon={KeyIcon} />}
                        size={'small'}
                        variant={'filled'}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title={t('models.guide')}>
                    <Link href={urlJoin(BASE_PROVIDER_DOC_URL, record.id)} target={'_blank'}>
                      <ActionIcon icon={BookIcon} size={'small'} variant={'filled'} />
                    </Link>
                  </Tooltip>
                  <Link
                    href={urlJoin('/discover/provider', record.id)}
                    style={{ color: 'inherit' }}
                  >
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
            width: 120,
          },
        ]}
        dataSource={providers}
        rowKey="id"
        scroll={{ x: 1000 }}
      />
    </Block>
  );
});

export default ProviderList;
