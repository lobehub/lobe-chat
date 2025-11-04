import { LOADING_FLAT } from '@lobechat/const';
import { UIChatMessage } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { ReactNode, memo } from 'react';

import { DefaultMessage } from '../Default';
import FileListViewer from '../User/FileListViewer';
import ImageFileListViewer from '../User/ImageFileListViewer';
import VideoFileListViewer from '../User/VideoFileListViewer';
import Reasoning from './Reasoning';
import Tool from './Tool';

// TODO: 待实现以下组件
// import FileChunks from './FileChunks';
// import IntentUnderstanding from './IntentUnderstanding';
// import SearchGrounding from './SearchGrounding';

export interface AssistantMessageContentProps extends UIChatMessage {
  editableContent: ReactNode;
  isGenerating?: boolean;
}

export const AssistantMessageContent = memo<AssistantMessageContentProps>(
  ({
    id,
    tools,
    content,
    imageList,
    videoList,
    fileList,
    isGenerating,
    editableContent,
    ...props
  }) => {
    const isToolCallGenerating = isGenerating && (content === LOADING_FLAT || !content) && !!tools;

    // 功能开关
    const showImageItems = !!imageList && imageList.length > 0;
    const showVideoItems = !!videoList && videoList.length > 0;
    const showFileItems = !!fileList && fileList.length > 0;
    const showReasoning =
      (!!props.reasoning && props.reasoning.content?.trim() !== '') ||
      (!props.reasoning && isGenerating);

    // TODO: 待实现功能
    // const showSearch = !!search && !!search.citations?.length;
    // const showFileChunks = !!chunksList && chunksList.length > 0;

    return (
      <Flexbox gap={8}>
        {/* TODO: 添加搜索引用 */}
        {/* {showSearch && <SearchGrounding citations={search?.citations} searchQueries={search?.searchQueries} />} */}

        {/* TODO: 添加文件块 */}
        {/* {showFileChunks && <FileChunks data={chunksList} />} */}

        {/* 推理过程 */}
        {showReasoning && (
          <Reasoning
            content={props.reasoning?.content}
            duration={props.reasoning?.duration}
            id={id}
            isGenerating={isGenerating}
          />
        )}

        {/* 主要内容 */}
        {content && (
          <DefaultMessage
            content={content}
            editableContent={editableContent}
            id={id}
            isToolCallGenerating={isToolCallGenerating}
            {...props}
          />
        )}

        {/* 图片列表 - 复用 User 的 ImageFileListViewer */}
        {showImageItems && <ImageFileListViewer items={imageList} />}

        {/* 视频列表 - 复用 User 的 VideoFileListViewer */}
        {showVideoItems && <VideoFileListViewer items={videoList} />}

        {/* 文件列表 - 复用 User 的 FileListViewer */}
        {showFileItems && <FileListViewer items={fileList} />}

        {/* 工具调用 */}
        {tools && tools.length > 0 && (
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
        )}
      </Flexbox>
    );
  },
);

AssistantMessageContent.displayName = 'AssistantMessageContent';
