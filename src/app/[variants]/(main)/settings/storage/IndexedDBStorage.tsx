'use client';

import { Skeleton } from 'antd';
import { DatabaseIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import GroupIcon from '@/components/GroupIcon';
import IndexCard from '@/components/IndexCard';
import ProgressItem from '@/components/ProgressItem';
import { formatSize } from '@/utils/format';

const IndexedDBStorage = memo(() => {
  const { t } = useTranslation('setting');
  const { data, isLoading } = useSWR('fetch-client-usage', async () => {
    const estimate = await navigator.storage.estimate();
    const quota = estimate.quota || 0;
    const usage = estimate.usage || 0;

    const percent = (usage / quota) * 100;

    return { percent: percent < 1 ? 1 : percent, total: quota, used: usage };
  });

  return (
    <IndexCard
      desc={t('storage.desc', { day: 15 })}
      icon={<GroupIcon icon={DatabaseIcon} />}
      padding={0}
      title={t('storage.title')}
    >
      {isLoading ? (
        <Flexbox padding={16}>
          <Skeleton active paragraph={{ rows: 1, width: '100%' }} title={false} />
          <Skeleton.Button active style={{ height: 48, width: '100%' }} />
        </Flexbox>
      ) : (
        <Flexbox gap={16} paddingBlock={16}>
          <ProgressItem
            percent={data?.percent || 0}
            title={t('storage.used')}
            usage={{
              total: data ? formatSize(data.total) : '-',
              used: data ? formatSize(data.used) : '-',
            }}
          />
        </Flexbox>
      )}
    </IndexCard>
  );
});

export default IndexedDBStorage;
