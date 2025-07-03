import { memo } from 'react';

import McpDetail from '../../McpList/Detail';
import PluginDetail from '../../PluginList/Detail';

interface DetailProps {
  identifier: string;
  runtimeType?: 'mcp' | 'default';
  type?: 'plugin' | 'customPlugin' | 'builtin';
}

const Detail = memo<DetailProps>(({ identifier, type, runtimeType }) => {
  if (runtimeType === 'mcp') return <McpDetail identifier={identifier} />;

  if (type === 'plugin') return <PluginDetail identifier={identifier} />;
});

export default Detail;
