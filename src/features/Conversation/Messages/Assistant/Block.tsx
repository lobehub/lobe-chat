import { Markdown } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import ImageFileListViewer from '@/features/Conversation/Messages/User/ImageFileListViewer';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { AssistantContentBlock } from '@/types/message';

import { DefaultMessage } from '../Default';
import Tool from './Tool';

interface AssistantBlockProps extends AssistantContentBlock {
  editableContent: ReactNode;
}
export const AssistantBlock = memo<AssistantBlockProps>(
  ({ id, tools, content, imageList, ...props }) => {
    const editing = useChatStore(chatSelectors.isMessageEditing(id));
    const generating = useChatStore(chatSelectors.isMessageGenerating(id));

    console.log(id, content, props);
    const isToolCallGenerating = generating && (content === LOADING_FLAT || !content) && !!tools;

    const showImageItems = !!imageList && imageList.length > 0;

    if (tools && tools.length > 0)
      return (
        <Flexbox gap={8}>
          {tools.map((toolCall, index) => (
            <Tool
              apiName={toolCall.apiName}
              arguments={toolCall.arguments}
              id={toolCall.id}
              identifier={toolCall.identifier}
              index={index}
              key={toolCall.id}
              messageId={id}
              payload={toolCall}
              type={toolCall.type}
            />
          ))}
        </Flexbox>
      );

    if (editing)
      return (
        <DefaultMessage
          content={content}
          id={id}
          isToolCallGenerating={isToolCallGenerating}
          {...(props as any)}
        />
      );

    return (
      <Flexbox gap={8} id={id}>
        <Markdown variant={'chat'}>{content}</Markdown>
        {showImageItems && <ImageFileListViewer items={imageList} />}
      </Flexbox>
    );
  },
);
