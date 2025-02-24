import { memo } from 'react';

import { BuiltinToolsRenders } from '@/tools/renders';
import { safeParseJSON } from '@/utils/safeParseJSON';

import Loading from '../Loading';
import { useParseContent } from '../useParseContent';

export interface BuiltinTypeProps {
  arguments?: string;
  content: string;
  id: string;
  identifier?: string;
  loading?: boolean;
  pluginError?: any;
  pluginState?: any;
}

const BuiltinType = memo<BuiltinTypeProps>(
  ({
    content,
    arguments: argumentsStr = '',
    pluginState,
    id,
    identifier,
    loading,
    pluginError,
  }) => {
    const { isJSON, data } = useParseContent(content);

    if (!isJSON) {
      return loading && <Loading />;
    }

    const Render = BuiltinToolsRenders[identifier || ''];

    if (!Render) return;

    const args = safeParseJSON(argumentsStr);

    return (
      <Render
        args={args}
        content={data}
        identifier={identifier}
        messageId={id}
        pluginError={pluginError}
        pluginState={pluginState}
      />
    );
  },
);

export default BuiltinType;
