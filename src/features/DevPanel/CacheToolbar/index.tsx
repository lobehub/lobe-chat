import { Empty } from 'antd';
import { Center } from 'react-layout-kit';

import { CachePanelContextProvider } from '@/features/DevPanel/CacheToolbar/cacheProvider';

import DataTable from './DataTable';
import { getCacheFiles } from './getCacheEntries';

const CacheToolbar = async () => {
  const files = await getCacheFiles();

  if (!files || files.length === 0)
    return (
      <Center height={'80%'}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <CachePanelContextProvider entries={files}>
      <DataTable />
    </CachePanelContextProvider>
  );
};

export default CacheToolbar;
