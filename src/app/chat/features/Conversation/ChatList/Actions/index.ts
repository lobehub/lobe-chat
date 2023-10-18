import { ChatListProps } from '@lobehub/ui';

import { AssistantActionsBar } from './Assistant';
import { DefaultActionsBar } from './Fallback';
import { FunctionActionsBar } from './Function';
import { UserActionsBar } from './User';

export const renderActions: ChatListProps['renderActions'] = {
  assistant: AssistantActionsBar,
  function: FunctionActionsBar,
  system: DefaultActionsBar,
  user: UserActionsBar,
};
