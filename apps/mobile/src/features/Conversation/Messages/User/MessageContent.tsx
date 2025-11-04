import { UIChatMessage } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { ReactNode, memo } from 'react';

import FileListViewer from './FileListViewer';
import ImageFileListViewer from './ImageFileListViewer';
import VideoFileListViewer from './VideoFileListViewer';

export interface UserMessageContentProps extends UIChatMessage {
  editableContent: ReactNode;
}

export const UserMessageContent = memo<UserMessageContentProps>(
  ({
    editableContent,
    imageList,
    videoList,
    fileList,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id,
  }) => {
    return (
      <Flexbox gap={8}>
        {editableContent}
        {/* 图片列表 */}
        {imageList && imageList.length > 0 && <ImageFileListViewer items={imageList} />}
        {/* 视频列表 */}
        {videoList && videoList.length > 0 && <VideoFileListViewer items={videoList} />}
        {/* 文件列表 - 点击直接在浏览器中打开下载 */}
        {fileList && fileList.length > 0 && <FileListViewer items={fileList} />}
      </Flexbox>
    );
  },
);

UserMessageContent.displayName = 'UserMessageContent';
