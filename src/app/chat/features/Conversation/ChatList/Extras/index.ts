import { ChatListProps } from '@lobehub/ui';

import { AssistantMessageExtra } from './Assistant';
import { UserMessageExtra } from './User';

export const renderMessagesExtra: ChatListProps['renderMessagesExtra'] = {
  assistant: AssistantMessageExtra,
  user: UserMessageExtra,
};
