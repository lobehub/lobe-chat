import { BookText, DatabaseIcon, FlagIcon, GlobeLockIcon } from 'lucide-react';

import CacheToolbar from './CacheToolbar';
import FeatureFlag from './FeatureFlag';
import FloatPanel from './FloatPanel';
import MetadataViewer from './MetadataViewer';
import PostgresViewer from './PostgresViewer';

const DevPanel = () => (
  <FloatPanel
    items={[
      {
        children: <PostgresViewer />,
        icon: <DatabaseIcon size={16} />,
        key: 'Postgres Viewer',
      },
      {
        children: <MetadataViewer />,
        icon: <BookText size={16} />,
        key: 'SEO Metadata',
      },
      {
        children: <CacheToolbar />,
        icon: <GlobeLockIcon size={16} />,
        key: 'NextJS Caches',
      },
      {
        children: <FeatureFlag />,
        icon: <FlagIcon size={16} />,
        key: 'Feature Flags',
      },
    ]}
  />
);

export default DevPanel;
