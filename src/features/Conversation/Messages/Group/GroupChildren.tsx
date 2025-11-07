import { AssistantContentBlock } from '@lobechat/types';
import { createStyles } from 'antd-style';
import { memo, use } from 'react';
import { Flexbox } from 'react-layout-kit';

import { VirtuosoContext } from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';

import { ContentBlock } from './ContentBlock';

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
  contentId?: string;
  disableEditing?: boolean;
  id: string;
  messageIndex: number;
}

const GroupChildren = memo<GroupChildrenProps>(
  ({ blocks, contentId, disableEditing, messageIndex, id }) => {
    const { styles } = useStyles();

    const [toggleMessageEditing] = useChatStore((s) => [s.toggleMessageEditing]);
    const virtuosoRef = use(VirtuosoContext);

    return (
      <Flexbox className={styles.container} gap={8}>
        {blocks.map((item, index) => {
          return item.id === contentId ? (
            <Flexbox
              key={index}
              onDoubleClick={(e) => {
                if (disableEditing || item.error || !e.altKey) return;

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
            // <motion.div
            //   animate={{ height: 'auto', opacity: 1 }}
            //   exit={{ height: 0, opacity: 0 }}
            //   initial={{ height: 0, opacity: 0 }}
            //   key={`${id}_${index}`}
            //   style={{ overflow: 'hidden' }}
            //   transition={{ duration: 0.3, ease: 'easeInOut' }}
            // >
            <ContentBlock index={index} key={`${id}_${index}`} {...item} />
            // </motion.div>
          );
        })}
      </Flexbox>
    );
  },
);

export default GroupChildren;
