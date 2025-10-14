import { Empty, Flexbox } from '@lobehub/ui-rn';
import { FileIcon, ImageIcon, SearchIcon } from 'lucide-react-native';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={24}>
      <Empty description="暂无文件" icon={FileIcon} />
      <Empty description="暂无图片" icon={ImageIcon} />
      <Empty description="暂无搜索结果" icon={SearchIcon} iconSize={48} />
    </Flexbox>
  );
};
