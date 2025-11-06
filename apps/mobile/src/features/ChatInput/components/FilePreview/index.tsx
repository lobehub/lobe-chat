import { Flexbox, ScrollShadow } from '@lobehub/ui-rn';
import { memo } from 'react';

import { createStyles } from '@/components/styles';
import { fileSelectors } from '@/store/file/selectors';
import { useFileStore } from '@/store/file/store';

import FileItem, { FILE_SIZE, PADDING } from './FileItem';

const useStyles = createStyles(() => ({
  container: {
    marginBottom: 8,
    minHeight: FILE_SIZE + PADDING * 4,
  },
}));

/**
 * FilePreview - Display upload file list with preview, name, size and status
 * Aligned with web's Desktop FilePreview component
 */
const FilePreview = memo(() => {
  const { styles } = useStyles();

  const uploadFileList = useFileStore(fileSelectors.getChatUploadFileList);
  const hasFiles = useFileStore(fileSelectors.uploadFileListHasItem);
  const removeChatUploadFile = useFileStore((s) => s.removeChatUploadFile);

  if (!hasFiles) return null;

  return (
    <ScrollShadow orientation="horizontal" size={4} style={styles.container}>
      <Flexbox gap={6} horizontal paddingBlock={PADDING}>
        {uploadFileList.map((file) => (
          <FileItem key={file.id} {...file} onRemove={removeChatUploadFile} />
        ))}
      </Flexbox>
    </ScrollShadow>
  );
});

FilePreview.displayName = 'FilePreview';

export default FilePreview;
