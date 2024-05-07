import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import Inspector from '../../Plugins/Inspector';
import PluginRender from '../../Plugins/Render';
import BubblesLoading from '../../components/BubblesLoading';

export const ToolMessage = memo<ChatMessage>(({ id, content, tool }) => {
  const fcProps = useChatStore(
    chatSelectors.getFunctionMessageProps({ content, id, plugin: tool }),
    isEqual,
  );

  const [showRender, setShow] = useState(true);

  if (content === LOADING_FLAT) return <BubblesLoading />;

  return (
    <Flexbox gap={12} id={id} width={'100%'}>
      <Inspector showRender={showRender} {...fcProps} setShow={setShow} />
      {showRender && (
        <PluginRender
          content={content}
          id={id}
          identifier={tool?.identifier}
          loading={fcProps.loading}
          payload={fcProps.command}
          type={fcProps.type}
        />
      )}
    </Flexbox>
  );
});
