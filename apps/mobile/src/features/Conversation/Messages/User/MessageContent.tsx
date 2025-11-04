import { UIChatMessage } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { ReactNode, memo } from 'react';

import ImageFileListViewer from './ImageFileListViewer';
import VideoFileListViewer from './VideoFileListViewer';

// TODO: 待实现文件列表查看器组件
// import FileListViewer from './FileListViewer';

export interface UserMessageContentProps extends UIChatMessage {
  editableContent: ReactNode;
}

export const UserMessageContent = memo<UserMessageContentProps>(
  ({
    editableContent,
    imageList,
    videoList,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileList,
  }) => {
    return (
      <Flexbox gap={8}>
        {editableContent}
        {/* 图片列表 */}
        {imageList && imageList.length > 0 && <ImageFileListViewer items={imageList} />}
        {/* 视频列表 */}
        {videoList && videoList.length > 0 && <VideoFileListViewer items={videoList} />}
        {/* TODO: 添加文件查看器支持 */}
        {/* {fileList && fileList?.length > 0 && <FileListViewer items={fileList} />} */}
      </Flexbox>
    );
  },
);

UserMessageContent.displayName = 'UserMessageContent';
