import { ReactNode, memo } from 'react';

import { isFunctionMessageAtStart } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import Inspector from '../Plugins/Inspector';
import { DefaultMessage } from './Default';

export const AssistantMessage = memo<
  ChatMessage & {
    editableContent: ReactNode;
  }
>(({ id, plugin, content, ...props }) => {
  const fcProps = useChatStore(chatSelectors.getFunctionMessageProps({ content, id, plugin }));

  if (!isFunctionMessageAtStart(content))
    return <DefaultMessage content={content} id={id} {...props} />;

  return (
    <div id={id}>
      <Inspector {...fcProps} />
    </div>
  );
});
