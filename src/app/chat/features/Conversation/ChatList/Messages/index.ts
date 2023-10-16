import { ChatListProps } from '@lobehub/ui';

import { AssistantActionsBar, AssistantMessage, AssistantMessageExtra } from './Assistant';
import { DefautMessage } from './Default';
import { FunctionActionsBar, FunctionMessage } from './Function';
import { SystemActionsBar } from './System';
import { UserActionsBar } from './User';

export const renderMessages: ChatListProps['renderMessages'] = {
  assistant: AssistantMessage,
  default: DefautMessage,
  function: FunctionMessage,
};

export const renderMessagesExtra: ChatListProps['renderMessagesExtra'] = {
  assistant: AssistantMessageExtra,
};

export const renderActions: ChatListProps['renderActions'] = {
  assistant: AssistantActionsBar,
  function: FunctionActionsBar,
  system: SystemActionsBar,
  user: UserActionsBar,
};
