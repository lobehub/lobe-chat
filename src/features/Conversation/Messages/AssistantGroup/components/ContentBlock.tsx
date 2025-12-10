import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { AssistantContentBlock } from '@/types/index';

import { messageStateSelectors, useConversationStore } from '../../../store';
import ImageFileListViewer from '../../components/ImageFileListViewer';
import Reasoning from '../../components/Reasoning';
import ErrorContent from '../Error';
import { Tools } from '../Tools';
import MessageContent from './MessageContent';

const ContentBlock = memo<AssistantContentBlock>(
  ({ id, tools, content, imageList, reasoning, error }) => {
    const showImageItems = !!imageList && imageList.length > 0;
    const isReasoning = useConversationStore(messageStateSelectors.isMessageInReasoning(id));
    const hasTools = tools && tools.length > 0;
    const showReasoning =
      (!!reasoning && reasoning.content?.trim() !== '') || (!reasoning && isReasoning);

    if (error && (content === LOADING_FLAT || !content))
      return <ErrorContent error={error} id={id} />;

    return (
      <Flexbox gap={8} id={id}>
        {showReasoning && <Reasoning {...reasoning} id={id} />}

        {/* Content - markdown text */}
        <MessageContent content={content} hasTools={hasTools} id={id} />

        {/* Image files */}
        {showImageItems && <ImageFileListViewer items={imageList} />}

        {/* Tools */}
        {hasTools && <Tools messageId={id} tools={tools} />}
      </Flexbox>
    );
  },
);

export default ContentBlock;
