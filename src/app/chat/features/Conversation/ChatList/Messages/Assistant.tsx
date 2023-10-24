import { RenderMessage } from '@lobehub/ui';
import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { chatSelectors } from '@/store/session/selectors';
import { isFunctionMessageAtStart } from '@/utils/message';

import Inspector from '../Plugins/Inspector';
import { DefaultMessage } from './Default';

export const AssistantMessage: RenderMessage = memo(({ id, plugin, content, ...props }) => {
  const fcProps = useSessionStore(chatSelectors.getFunctionMessageProps({ content, id, plugin }));

  if (!isFunctionMessageAtStart(content))
    return <DefaultMessage content={content} id={id} {...props} />;

  return (
    <div id={id}>
      <Inspector {...fcProps} />
    </div>
  );
});
