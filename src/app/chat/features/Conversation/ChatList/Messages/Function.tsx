import { RenderMessage } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
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

  return (
    <Flexbox gap={12} id={id}>
      <Inspector {...fcProps} />
      <PluginRender content={content} loading={fcProps.loading} name={name} type={fcProps.type} />
    </Flexbox>
  );
});
