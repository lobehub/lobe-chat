import { BookText, Cog, DatabaseIcon, FlagIcon, GlobeLockIcon, Package } from 'lucide-react';

import CacheViewer from './CacheViewer';
import FeatureFlagViewer from './FeatureFlagViewer';
import MetadataViewer from './MetadataViewer';
import PostgresViewer from './PostgresViewer';
import StoreFlag from './StoreFlag';
import SystemInspector from './SystemInspector';
import FloatPanel from './features/FloatPanel';

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
        children: <CacheViewer />,
        icon: <GlobeLockIcon size={16} />,
        key: 'NextJS Caches',
      },
      {
        children: <FeatureFlagViewer />,
        icon: <FlagIcon size={16} />,
        key: 'Feature Flags',
      },
      {
        children: <SystemInspector />,
        icon: <Cog size={16} />,
        key: 'System Status',
      },
      {
        children: <StoreFlag />,
        icon: <Package size={16} />,
        key: 'Store Flags',
      },
    ]}
  />
);

export default DevPanel;
