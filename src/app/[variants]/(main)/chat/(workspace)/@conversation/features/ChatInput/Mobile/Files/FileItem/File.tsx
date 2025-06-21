import { ActionIcon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Trash } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { UploadFileItem } from '@/types/files';

import UploadDetail from '../../../../../../../../../../../features/ChatInput/components/UploadDetail';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    width: 250px;
    height: 64px;
    padding-block: 4px;
    padding-inline: 8px 24px;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    background: ${token.colorFillTertiary};
  `,
  deleteButton: css`
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;

    color: #fff;

    background: ${token.colorBgMask};

    &:hover {
      background: ${token.colorError};
    }
  `,
}));

interface FileItemProps extends UploadFileItem {
  onRemove?: () => void;
}

const FileItem = memo<FileItemProps>(({ id, onRemove, file, status, uploadState, tasks }) => {
  const { styles } = useStyles();

  return (
    <Flexbox align={'center'} className={styles.container} gap={12} horizontal key={id}>
      <FileIcon fileName={file.name} fileType={file.type} />
      <Flexbox style={{ overflow: 'hidden' }}>
        <Text ellipsis>{file.name}</Text>
        <UploadDetail size={file.size} status={status} tasks={tasks} uploadState={uploadState} />
      </Flexbox>
      <ActionIcon
        className={styles.deleteButton}
        glass
        icon={Trash}
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        size={'small'}
      />
    </Flexbox>
  );
});
export default FileItem;
