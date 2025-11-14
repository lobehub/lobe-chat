import { AssistantContentBlock } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { memo, use } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ContentBlock } from '@/features/Conversation/Messages/Group/ContentBlock';
import { VirtuosoContext } from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';

interface GroupItemProps extends AssistantContentBlock {
  contentId?: string;
  disableEditing?: boolean;
  index: number;
  messageIndex: number;
}

const GroupItem = memo<GroupItemProps>(
  ({ contentId, messageIndex, index, disableEditing, error, ...item }) => {
    const [toggleMessageEditing] = useChatStore((s) => [s.toggleMessageEditing]);
    const virtuosoRef = use(VirtuosoContext);

    return item.id === contentId ? (
      <Flexbox
        onDoubleClick={(e) => {
          if (disableEditing || error || !e.altKey) return;

          toggleMessageEditing(item.id, true);
          virtuosoRef?.current?.scrollIntoView({
            align: 'start',
            behavior: 'auto',
            index: messageIndex,
          });
        }}
      >
        <ContentBlock index={index} {...item} />
      </Flexbox>
    ) : (
      <ContentBlock index={index} {...item} />
    );
  },
  isEqual,
);
export default GroupItem;
