import { ChatToolPayloadWithResult, UIChatMessage } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { ReactNode, memo } from 'react';

import { useChatStore } from '@/store/chat';
import { aiChatSelectors } from '@/store/chat/selectors';

import FileListViewer from '../User/FileListViewer';
import ImageFileListViewer from '../User/ImageFileListViewer';
import VideoFileListViewer from '../User/VideoFileListViewer';
import Reasoning from './Reasoning';
import Tool from './Tool';

// TODO: 待实现以下组件
// import FileChunks from './FileChunks';
// import IntentUnderstanding from './IntentUnderstanding';

export interface AssistantMessageContentProps extends UIChatMessage {
  editableContent: ReactNode;
  isGenerating?: boolean;
}

export const AssistantMessageContent = memo<AssistantMessageContentProps>(
  ({ id, tools, imageList, videoList, fileList, editableContent, ...props }) => {
    const isReasoning = useChatStore(aiChatSelectors.isMessageInReasoning(id));

    // 功能开关
    const showImageItems = !!imageList && imageList.length > 0;
    const showVideoItems = !!videoList && videoList.length > 0;
    const showFileItems = !!fileList && fileList.length > 0;
    const showReasoning =
      (!!props.reasoning && props.reasoning.content?.trim() !== '') ||
      (!props.reasoning && isReasoning);

    // TODO: 待实现功能
    // const showFileChunks = !!chunksList && chunksList.length > 0;

    return (
      <Flexbox gap={8}>
        {/* 搜索引用 - 通过 Markdown 的 Footnotes 功能自动处理 citations */}
        {/* TODO: 添加文件块 */}
        {/* {showFileChunks && <FileChunks data={chunksList} />} */}

        {/* 推理过程 */}
        {showReasoning && (
          <Reasoning
            content={props.reasoning?.content}
            duration={props.reasoning?.duration}
            id={id}
            isGenerating={isReasoning}
          />
        )}

        {/* 文本内容 - 由 renderMessage 传入的 editableContent */}
        {editableContent}

        {/* 图片列表 - 复用 User 的 ImageFileListViewer */}
        {showImageItems && <ImageFileListViewer items={imageList} />}

        {/* 视频列表 - 复用 User 的 VideoFileListViewer */}
        {showVideoItems && <VideoFileListViewer items={videoList} />}

        {/* 文件列表 - 复用 User 的 FileListViewer */}
        {showFileItems && <FileListViewer items={fileList} />}

        {/* 工具调用 */}
        {tools && tools.length > 0 && (
          <Flexbox gap={8}>
            {(tools as ChatToolPayloadWithResult[]).map((toolCall, index) => (
              <Tool
                apiName={toolCall.apiName}
                arguments={toolCall.arguments}
                id={toolCall.id}
                identifier={toolCall.identifier}
                index={index}
                key={toolCall.id}
                messageId={id}
                result={toolCall.result}
                type={toolCall.type}
              />
            ))}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

AssistantMessageContent.displayName = 'AssistantMessageContent';
