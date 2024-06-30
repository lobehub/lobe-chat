import { memo } from 'react';

import { BuiltinToolsRenders } from '@/tools/renders';

import Loading from '../Loading';
import { useParseContent } from '../useParseContent';

export interface BuiltinTypeProps {
  content: string;
  id: string;
  identifier?: string;
  loading?: boolean;
  pluginState?: any;
}

const BuiltinType = memo<BuiltinTypeProps>(({ content, pluginState, id, identifier, loading }) => {
  const { isJSON, data } = useParseContent(content);

  if (!isJSON) {
    return loading && <Loading />;
  }

  const Render = BuiltinToolsRenders[identifier || ''];

  if (!Render) return;

  return <Render content={data} identifier={identifier} messageId={id} pluginState={pluginState} />;
});

export default BuiltinType;
