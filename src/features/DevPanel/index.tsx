import { DatabaseIcon, GlobeLockIcon } from 'lucide-react';

import CacheToolbar from './CacheToolbar';
import FloatPanel from './FloatPanel';
import PostgresViewer from './PostgresViewer';

const DevPanel = () => (
  <FloatPanel
    items={[
      {
        children: <PostgresViewer />,
        icon: <DatabaseIcon size={16} />,
        key: 'postgres',
        label: 'Postgres Viewer',
      },
      {
        children: <CacheToolbar />,
        icon: <GlobeLockIcon size={16} />,
        key: 'cache',
        label: 'NextJS Caches',
      },
    ]}
  />
);

export default DevPanel;
