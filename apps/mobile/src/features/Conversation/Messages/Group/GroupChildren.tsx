import { AssistantContentBlock } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';

import { createStyles } from '@/components/styles';

import { ContentBlock } from './ContentBlock';

const useStyles = createStyles(() => ({
  container: {
    width: '100%',
  },
}));

interface GroupChildrenProps {
  blocks: AssistantContentBlock[];
  contentId?: string;
  disableEditing?: boolean;
  isGenerating?: boolean;
  messageIndex: number;
}

const GroupChildren = memo<GroupChildrenProps>(({ blocks, contentId, isGenerating }) => {
  const { styles } = useStyles();

  return (
    <Flexbox gap={8} style={styles.container}>
      {blocks.map((item, index) => {
        const isCurrentContent = item.id === contentId;
        const shouldGenerating = isCurrentContent && isGenerating;

        return (
          <Flexbox key={index}>
            <ContentBlock
              index={index}
              isGenerating={shouldGenerating}
              isSummary={isCurrentContent}
              {...item}
            />
          </Flexbox>
        );
      })}
    </Flexbox>
  );
});

GroupChildren.displayName = 'GroupChildren';

export default GroupChildren;
