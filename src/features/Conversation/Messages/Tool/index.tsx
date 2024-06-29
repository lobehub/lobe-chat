import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import PluginRender from '../../Plugins/Render';
import Arguments from '../components/Arguments';
import Inspector from './Inspector';

export const ToolMessage = memo<ChatMessage>(({ id, content, pluginState, plugin }) => {
  const loading = useChatStore(chatSelectors.isPluginApiInvoking(id));

  const [showRender, setShow] = useState(plugin?.type !== 'default');

  return (
    <Flexbox gap={12} id={id} width={'100%'}>
      <Inspector
        arguments={plugin?.arguments}
        content={content}
        identifier={plugin?.identifier}
        loading={loading}
        payload={plugin}
        setShow={setShow}
        showRender={showRender}
      />
      {showRender || loading ? (
        <PluginRender
          content={content}
          id={id}
          identifier={plugin?.identifier}
          loading={loading}
          payload={plugin}
          pluginState={pluginState}
          type={plugin?.type}
        />
      ) : (
        <Arguments arguments={plugin?.arguments} />
      )}
    </Flexbox>
  );
});
