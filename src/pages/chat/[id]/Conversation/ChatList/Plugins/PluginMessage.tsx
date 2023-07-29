import { memo } from 'react';

import { PluginsRender } from '@/plugins';
import { ChatMessage } from '@/types/chatMessage';

import PluginResult from './PluginResultRender';

export interface FunctionMessageProps extends ChatMessage {
  loading?: boolean;
}

const PluginMessage = memo<FunctionMessageProps>(({ content, name }) => {
  const Render = PluginsRender[name || ''];

  if (Render) {
    return <Render content={JSON.parse(content)} name={name || 'unknown'} />;
  }

  return <PluginResult content={content} />;
});

export default PluginMessage;
