import { AssistantContentBlock } from '@lobechat/types';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

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
  contentId?: string;
  disableEditing?: boolean;
  id: string;
  messageIndex: number;
}

const GroupChildren = memo<GroupChildrenProps>(
  ({ blocks, contentId, disableEditing, messageIndex, id }) => {
    const { styles } = useStyles();

    return (
      <Flexbox className={styles.container} gap={8}>
        {blocks.map((item, index) => {
          return (
            <GroupItem
              {...item}
              contentId={contentId}
              disableEditing={disableEditing}
              index={index}
              key={`${id}_${index}`}
              messageIndex={messageIndex}
            />
          );
        })}
      </Flexbox>
    );
  },
  isEqual,
);

export default GroupChildren;
