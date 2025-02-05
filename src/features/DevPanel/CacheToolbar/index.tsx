import DataTable from './DataTable';
import { getCacheFiles } from './getCacheEntries';

const CacheToolbar = async () => {
  const files = await getCacheFiles();

  return <DataTable data={files} />;
};

export default CacheToolbar;
