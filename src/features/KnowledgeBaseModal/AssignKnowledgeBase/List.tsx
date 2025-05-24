import { Icon } from '@lobehub/ui';
import { Empty } from 'antd';
import { ServerCrash } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useAgentStore } from '@/store/agent';

import Item from './Item';
import Loading from './Loading';

export const List = memo(() => {
  const { t } = useTranslation('file');

  const useFetchFilesAndKnowledgeBases = useAgentStore((s) => s.useFetchFilesAndKnowledgeBases);

  const { isLoading, error, data } = useFetchFilesAndKnowledgeBases();

  const isEmpty = data && data.length === 0;

  return isLoading ? (
    <Loading />
  ) : isEmpty ? (
    <Center gap={12} padding={40}>
      {error ? (
        <>
          <Icon icon={ServerCrash} size={80} />
          {t('networkError')}
        </>
      ) : (
        <Empty description={t('empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Center>
  ) : (
    <Virtuoso
      itemContent={(index) => {
        const item = data![index];
        return <Item key={item.id} {...item} />;
      }}
      overscan={400}
      style={{ height: 500, marginInline: -16 }}
      totalCount={data!.length}
    />
  );
});

export default List;
