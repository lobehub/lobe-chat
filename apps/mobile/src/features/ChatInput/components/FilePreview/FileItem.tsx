import { ActionIcon, Cell } from '@lobehub/ui-rn';
import { X } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { createStyles } from '@/components/styles';
import { MobileUploadFileItem } from '@/types/file';

import FileContent from './FileContent';
import UploadStatus from './UploadStatus';

export const FILE_SIZE = 50;
export const ITEM_WIDTH = 164;
export const PADDING = 4;

const useStyles = createStyles(({ token }) => ({
  container: {
    borderRadius: token.borderRadiusLG * 2,
    height: FILE_SIZE + PADDING * 2,
    position: 'relative',
  },
  fileInfo: {
    flex: 1,
    paddingBottom: 4,
    paddingInline: 4,
  },
  filePreview: {
    height: FILE_SIZE,
    maxWidth: FILE_SIZE,
    padding: 4,
  },
  removeButton: {
    backgroundColor: token.colorText,
    position: 'absolute',
    right: -PADDING,
    top: -PADDING,
    zIndex: 10,
  },
  wrap: {
    height: FILE_SIZE + PADDING * 2,
    position: 'relative',
    width: ITEM_WIDTH,
  },
}));

interface FileItemProps extends MobileUploadFileItem {
  onRemove: (id: string) => void;
}

/**
 * FileItem - Display file upload item with preview, name, size and status
 * Aligned with web's Desktop FilePreview FileItem component
 */
const FileItem = memo<FileItemProps>((props) => {
  const { id, name, size, status, fileType, previewUrl, url, uploadState, onRemove } = props;
  const { styles, theme } = useStyles();

  const handleRemove = (e?: any) => {
    e?.stopPropagation();
    onRemove(id);
  };

  return (
    <View style={styles.wrap}>
      <Cell
        description={<UploadStatus size={size || 0} status={status} uploadState={uploadState} />}
        glass
        icon={
          <FileContent
            fileType={fileType}
            name={name}
            previewUrl={previewUrl}
            size={FILE_SIZE}
            url={url}
          />
        }
        iconSize={FILE_SIZE}
        paddingBlock={PADDING}
        paddingInline={PADDING}
        showArrow={false}
        style={styles.container}
        title={name || 'Unknown'}
        titleProps={{
          fontSize: 13,
        }}
        variant={'outlined'}
      />

      {/* Remove Button */}
      <ActionIcon
        color={theme.colorBgLayout}
        icon={X}
        onPress={handleRemove}
        size={{
          blockSize: 20,
          size: 14,
          strokeWidth: 3,
        }}
        style={[styles.removeButton]}
        variant={'outlined'}
      />
    </View>
  );
});

FileItem.displayName = 'FileItem';

export default FileItem;
