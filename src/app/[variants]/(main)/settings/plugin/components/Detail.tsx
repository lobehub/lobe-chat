import { memo } from 'react';

import McpDetail from '@/features/PluginStore/McpList/Detail';
import PluginDetail from '@/features/PluginStore/PluginList/Detail';
import CustomPluginEmptyState from '@/features/PluginStore/InstalledList/Detail/CustomPluginEmptyState';

interface DetailProps {
  identifier: string;
  runtimeType?: 'mcp' | 'default';
  type?: 'plugin' | 'customPlugin' | 'builtin';
}

const Detail = memo<DetailProps>(({ identifier, type, runtimeType }) => {
  if (type === 'customPlugin') return <CustomPluginEmptyState identifier={identifier} />;

  if (runtimeType === 'mcp') return <McpDetail identifier={identifier} />;

  if (type === 'plugin') return <PluginDetail identifier={identifier} />;

  return null;
});

export default Detail; 