import { ChatFileItem } from '@lobechat/types';
import { Cell } from '@lobehub/ui-rn';
import { memo } from 'react';
import { Linking } from 'react-native';

import MaterialFileTypeIcon from '@/components/MaterialFileTypeIcon';

/**
 * 格式化文件大小
 */
const formatSize = (bytes?: number) => {
  if (!bytes) return '';

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * FileItem - 文件列表项
 *
 * 点击文件时直接在浏览器中打开下载
 */
const FileItem = memo<ChatFileItem>(({ url, name, size }) => {
  const handlePress = () => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <Cell
      borderRadius={true}
      description={size ? formatSize(size) : undefined}
      icon={<MaterialFileTypeIcon filename={name} size={32} type={'file'} />}
      iconSize={32}
      onPress={handlePress}
      pressEffect
      showArrow={false}
      style={{
        maxWidth: '100%',
      }}
      title={name}
      titleProps={{
        fontSize: 14,
      }}
      variant={'outlined'}
    />
  );
});

FileItem.displayName = 'FileItem';

export default FileItem;
