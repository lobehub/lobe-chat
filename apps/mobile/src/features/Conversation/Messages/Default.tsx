import { UIChatMessage } from '@lobechat/types';
import { ReactNode, memo } from 'react';

export interface DefaultMessageProps extends UIChatMessage {
  editableContent?: ReactNode;
  isToolCallGenerating?: boolean;
}

export const DefaultMessage = memo<DefaultMessageProps>(
  ({ editableContent, isToolCallGenerating }) => {
    if (isToolCallGenerating) return null;

    return editableContent;
  },
);

DefaultMessage.displayName = 'DefaultMessage';
