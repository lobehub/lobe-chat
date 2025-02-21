import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import { LobeToolRenderType } from '@/types/tool';

import DefaultType from './DefaultType';
import Markdown from './MarkdownType';

const loading = () => <Skeleton.Button active block style={{ height: 120, width: '100%' }} />;

const Standalone = dynamic(() => import('./StandaloneType'), { loading });
const BuiltinType = dynamic(() => import('./BuiltinType'), { loading });

export interface PluginRenderProps {
  arguments?: string;
  content: string;
  id: string;
  identifier?: string;
  loading?: boolean;
  payload?: PluginRequestPayload;
  pluginState?: any;
  type?: LobeToolRenderType;
}

const PluginRender = memo<PluginRenderProps>(
  ({
    content,
    arguments: argumentsStr = '',
    id,
    payload,
    pluginState,
    identifier,
    type,
    loading,
  }) => {
    switch (type) {
      case 'standalone': {
        return <Standalone id={id} name={identifier} payload={payload} />;
      }

      case 'builtin': {
        return (
          <BuiltinType
            arguments={argumentsStr}
            content={content}
            id={id}
            identifier={identifier}
            loading={loading}
            pluginState={pluginState}
          />
        );
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
