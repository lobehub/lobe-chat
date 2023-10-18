import { ChatListProps } from '@lobehub/ui';

import { AssistantMessage } from './Assistant';
import { DefaultMessage } from './Default';
import { FunctionMessage } from './Function';

export const renderMessages: ChatListProps['renderMessages'] = {
  assistant: AssistantMessage,
  default: DefaultMessage,
  function: FunctionMessage,
};
