import { safeParseJSON } from '@lobechat/utils';
import { memo } from 'react';

import { getBuiltinRender } from '@/tools/renders';

import { useParseContent } from '../useParseContent';

export interface BuiltinTypeProps {
  apiName?: string;
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
    pluginError,
    apiName,
  }) => {
    const { data } = useParseContent(content);

    const Render = getBuiltinRender(identifier, apiName);

    if (!Render) return;

    const args = safeParseJSON(argumentsStr);

    return (
      <Render
        apiName={apiName}
        args={args || {}}
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
