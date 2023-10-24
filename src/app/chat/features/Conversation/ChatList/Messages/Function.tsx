import { RenderMessage } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { chatSelectors } from '@/store/session/selectors';

import Inspector from '../Plugins/Inspector';
import PluginRender from '../Plugins/Render';

export const FunctionMessage: RenderMessage = memo(({ id, content, plugin, name }) => {
  const fcProps = useSessionStore(
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
