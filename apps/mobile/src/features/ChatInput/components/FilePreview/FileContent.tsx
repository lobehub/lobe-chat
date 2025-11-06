import { Block } from '@lobehub/ui-rn';
import { memo } from 'react';

import Image from '@/components/Image';
import MaterialFileTypeIcon from '@/components/MaterialFileTypeIcon';
import Video from '@/components/Video';
import { MobileUploadFileItem } from '@/types/file';

interface FileContentProps extends Partial<MobileUploadFileItem> {
  size?: number;
}

/**
 * FileContent - Display file preview based on file type
 * Aligned with web's Content component
 */
const FileContent = memo<FileContentProps>(({ fileType, name, previewUrl, url, size = 64 }) => {
  const displayUrl = previewUrl || url;

  // Image files - show actual preview
  if (fileType?.startsWith('image') && displayUrl) {
    return (
      <Block height={size} variant={'outlined'} width={size}>
        <Image
          autoSize={false}
          contentFit="cover"
          height={size}
          preview={false}
          source={displayUrl}
          width={size}
        />
      </Block>
    );
  }

  // Video files - show video preview
  if (fileType?.startsWith('video') && displayUrl) {
    return (
      <Block height={size} variant={'outlined'} width={size}>
        <Video contentFit="cover" height={size} muted src={displayUrl} width={size} />
      </Block>
    );
  }

  // Other files - show file icon
  return (
    <Block height={size} variant={'outlined'} width={size}>
      <MaterialFileTypeIcon filename={name || ''} size={size * 0.75} type={'file'} />
    </Block>
  );
});

FileContent.displayName = 'FileContent';

export default FileContent;
