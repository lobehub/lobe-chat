import { LobePluginType, PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { memo } from 'react';

import DefaultType from './DefaultType';
import Standalone from './StandaloneType';

export interface PluginRenderProps {
  content: string;
  id: string;
  loading?: boolean;
  name?: string;
  payload?: PluginRequestPayload;
  type?: LobePluginType;
}

const PluginRender = memo<PluginRenderProps>(({ content, id, payload, name, type }) => {
  switch (type) {
    case 'standalone': {
      return <Standalone id={id} name={name} payload={payload} />;
    }

    default: {
      return <DefaultType content={content} name={name} />;
    }
  }
});

export default PluginRender;
