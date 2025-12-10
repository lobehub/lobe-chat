import { AssistantContentBlock } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useConversationStore } from '../../store';
import { ContentBlock } from './ContentBlock';

interface GroupItemProps extends AssistantContentBlock {
  contentId?: string;
  disableEditing?: boolean;
  index: number;
  messageIndex: number;
}

const GroupItem = memo<GroupItemProps>(({ contentId, index, disableEditing, error, ...item }) => {
  const toggleMessageEditing = useConversationStore((s) => s.toggleMessageEditing);

  return item.id === contentId ? (
    <Flexbox
      onDoubleClick={(e) => {
        if (disableEditing || error || !e.altKey) return;

        toggleMessageEditing(item.id, true);
      }}
    >
      <ContentBlock index={index} {...item} error={error} />
    </Flexbox>
  ) : (
    <ContentBlock index={index} {...item} error={error} />
  );
}, isEqual);
export default GroupItem;
