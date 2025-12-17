import { AssistantContentBlock, UIChatMessage } from '@lobechat/types';
import { memo } from 'react';

import WithContentId from './WithContentId';
import WithoutContentId from './WithoutContentId';

interface GroupActionsProps {
  contentBlock?: AssistantContentBlock;
  contentId?: string;
  data: UIChatMessage;
  id: string;
  index: number;
}

export const GroupActionsBar = memo<GroupActionsProps>(
  ({ id, data, contentBlock, index, contentId }) => {
    if (!contentId) return <WithoutContentId data={data} id={id} />;

    return <WithContentId contentBlock={contentBlock} data={data} id={id} index={index} />;
  },
);
