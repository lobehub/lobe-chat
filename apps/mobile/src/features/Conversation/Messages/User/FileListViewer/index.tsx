import { ChatFileItem } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';

import FileItem from './FileItem';

interface FileListViewerProps {
  items: ChatFileItem[];
}

/**
 * FileListViewer - 文件列表查看器
 *
 * 展示消息中的文件列表
 * 移动端不支持预览，点击文件直接在浏览器中打开下载
 */
const FileListViewer = memo<FileListViewerProps>(({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <Flexbox gap={8}>
      {items.map((item) => (
        <FileItem key={item.id} {...item} />
      ))}
    </Flexbox>
  );
});

FileListViewer.displayName = 'FileListViewer';

export default FileListViewer;
