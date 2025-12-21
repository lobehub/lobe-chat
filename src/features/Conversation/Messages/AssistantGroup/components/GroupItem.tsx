import { Flexbox } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { AssistantContentBlock } from '@/types/index';

import { useConversationStore } from '../../../store';
import ContentBlock from './ContentBlock';

interface GroupItemProps extends AssistantContentBlock {
  contentId?: string;
  disableEditing?: boolean;
  messageIndex: number;
}

const GroupItem = memo<GroupItemProps>(({ contentId, disableEditing, error, ...item }) => {
  const toggleMessageEditing = useConversationStore((s) => s.toggleMessageEditing);

  return item.id === contentId ? (
    <Flexbox
      onDoubleClick={(e) => {
        if (disableEditing || error || !e.altKey) return;
        toggleMessageEditing(item.id, true);
      }}
    >
      <ContentBlock {...item} error={error} />
    </Flexbox>
  ) : (
    <ContentBlock {...item} error={error} />
  );
}, isEqual);

export default GroupItem;
