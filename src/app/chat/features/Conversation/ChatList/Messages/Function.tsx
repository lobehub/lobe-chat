import { RenderMessage } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Inspector from '../Plugins/Inspector';
import PluginRender from '../Plugins/Render';

export const FunctionMessage: RenderMessage = memo(({ id, content, plugin, name }) => {
  const fcProps = useChatStore(
    chatSelectors.getFunctionMessageProps({ content, id, plugin }),
    isEqual,
  );
  const [showRender, setShow] = useState(true);

  return (
    <Flexbox gap={12} id={id}>
      <Inspector showRender={showRender} {...fcProps} setShow={setShow} />
      {showRender && (
        <PluginRender
          content={content}
          id={id}
          loading={fcProps.loading}
          name={name}
          payload={fcProps.command}
          type={fcProps.type}
        />
      )}
    </Flexbox>
  );
});
