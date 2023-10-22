import { LobePluginType } from '@lobehub/chat-plugin-sdk';
import { memo } from 'react';

import DefaultType from './DefaultType';
import Standalone from './StandaloneType';

export interface PluginRenderProps {
  content: string;
  loading?: boolean;
  name?: string;
  type?: LobePluginType;
}

const PluginRender = memo<PluginRenderProps>(({ content, name, type }) => {
  switch (type) {
    case 'standalone': {
      return <Standalone name={name} />;
    }

    default: {
      return <DefaultType content={content} name={name} />;
    }
  }
});

export default PluginRender;
