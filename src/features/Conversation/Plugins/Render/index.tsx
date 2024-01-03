import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { memo } from 'react';

import { LobeToolRenderType } from '@/types/tool';

import BuiltinType from '././BuiltinType';
import DefaultType from './DefaultType';
import Markdown from './MarkdownType';
import Standalone from './StandaloneType';

export interface PluginRenderProps {
  content: string;
  id: string;
  identifier?: string;
  loading?: boolean;
  payload?: PluginRequestPayload;
  type?: LobeToolRenderType;
}

const PluginRender = memo<PluginRenderProps>(
  ({ content, id, payload, identifier, type, loading }) => {
    switch (type) {
      case 'standalone': {
        return <Standalone id={id} name={identifier} payload={payload} />;
      }

      case 'builtin': {
        return <BuiltinType content={content} id={id} identifier={identifier} loading={loading} />;
      }

      case 'markdown': {
        return <Markdown content={content} loading={loading} />;
      }

      default: {
        return <DefaultType content={content} loading={loading} name={identifier} />;
      }
    }
  },
);

export default PluginRender;
