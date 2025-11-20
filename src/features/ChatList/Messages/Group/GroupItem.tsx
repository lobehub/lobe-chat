import { AssistantContentBlock } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { memo, use } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

import { VirtuaContext } from '../../components/VirtualizedList/VirtuosoContext';
import { ContentBlock } from './ContentBlock';

interface GroupItemProps extends AssistantContentBlock {
  contentId?: string;
  disableEditing?: boolean;
  index: number;
  messageIndex: number;
}

const GroupItem = memo<GroupItemProps>(
  ({ contentId, messageIndex, index, disableEditing, error, ...item }) => {
    const [toggleMessageEditing] = useChatStore((s) => [s.toggleMessageEditing]);
    const virtuaRef = use(VirtuaContext);

    return item.id === contentId ? (
      <Flexbox
        onDoubleClick={(e) => {
          if (disableEditing || error || !e.altKey) return;

          toggleMessageEditing(item.id, true);
          virtuaRef?.current?.scrollToIndex(messageIndex, {
            align: 'start',
          });
        }}
      >
        <ContentBlock index={index} {...item} error={error} />
      </Flexbox>
    ) : (
      <ContentBlock index={index} {...item} error={error} />
    );
  },
  isEqual,
);
export default GroupItem;
