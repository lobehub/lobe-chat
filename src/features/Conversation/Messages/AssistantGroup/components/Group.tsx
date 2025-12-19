import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AssistantContentBlock } from '@/types/index';

import { messageStateSelectors, useConversationStore } from '../../../store';
import { CollapsedMessage } from './CollapsedMessage';
import { GroupMessageContext } from './GroupContext';
import GroupItem from './GroupItem';

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      &:has(.tool-blocks) {
        width: 100%;
      }
    `,
  };
});

interface GroupChildrenProps {
  blocks: AssistantContentBlock[];
  content?: string;
  contentId?: string;
  disableEditing?: boolean;
  id: string;
  messageIndex: number;
}

const Group = memo<GroupChildrenProps>(
  ({ blocks, contentId, disableEditing, messageIndex, id, content }) => {
    const { styles } = useStyles();
    const isCollapsed = useConversationStore(messageStateSelectors.isMessageCollapsed(id));
    const contextValue = useMemo(() => ({ assistantGroupId: id }), [id]);

    if (isCollapsed) {
      return (
        content && (
          <Flexbox>
            <CollapsedMessage content={content} id={id} />
          </Flexbox>
        )
      );
    }
    return (
      <GroupMessageContext value={contextValue}>
        <Flexbox className={styles.container} gap={8}>
          {blocks.map((item) => {
            return (
              <GroupItem
                {...item}
                contentId={contentId}
                disableEditing={disableEditing}
                key={id + '.' + item.id}
                messageIndex={messageIndex}
              />
            );
          })}
        </Flexbox>
      </GroupMessageContext>
    );
  },
  isEqual,
);

export default Group;
