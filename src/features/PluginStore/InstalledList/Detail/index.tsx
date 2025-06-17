import { memo } from 'react';

import { LobeToolType } from '@/types/tool/tool';

import McpDetail from '../../McpList/Detail';
import PluginDetail from '../../PluginList/Detail';

const Detail = memo<{ identifier: string; type?: LobeToolType }>(({ identifier, type }) => {
  if (type === 'plugin') return <PluginDetail identifier={identifier} />;
  if (type === 'customPlugin') return <div>TODO:customPlugin</div>;
  return <McpDetail identifier={identifier} />;
});

export default Detail;
