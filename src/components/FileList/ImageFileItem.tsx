import { ActionIcon, Image } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Trash } from 'lucide-react';
import { CSSProperties, memo, useCallback } from 'react';

import { usePlatform } from '@/hooks/usePlatform';
import { useFileStore } from '@/store/file';

import { MIN_IMAGE_SIZE } from './style';

export const useStyles = createStyles(({ css, token }) => ({
  deleteButton: css`
    color: #fff;
    background: ${token.colorBgMask};

    &:hover {
      background: ${token.colorError};
    }
  `,
  editableImage: css`
    background: ${token.colorBgContainer};
    box-shadow: 0 0 0 1px ${token.colorFill} inset;
  `,
  image: css`
    margin-block: 0 !important;
  `,
}));

interface FileItemProps {
  alwaysShowClose?: boolean;
  className?: string;
  editable?: boolean;
  id: string;
  onClick?: () => void;
  style?: CSSProperties;
}
const ImageFileItem = memo<FileItemProps>(({ editable, id, alwaysShowClose }) => {
  const [useFetchFile, removeFile] = useFileStore((s) => [s.useFetchFile, s.removeFile]);
  const IMAGE_SIZE = editable ? MIN_IMAGE_SIZE : '100%';
  const { data, isLoading } = useFetchFile(id);
  const { styles, cx } = useStyles();
  const { isSafari } = usePlatform();

  const handleRemoveFile = useCallback(
    (e: any) => {
      e.stopPropagation();
      removeFile(id);
    },
    [id],
  );

  return (
    <Image
      actions={
        editable && (
          <ActionIcon
            className={styles.deleteButton}
            glass
            icon={Trash}
            onClick={handleRemoveFile}
            size={'small'}
          />
        )
      }
      alt={data?.name || id || ''}
      alwaysShowActions={alwaysShowClose}
      height={isSafari ? 'auto' : '100%'}
      isLoading={isLoading}
      size={IMAGE_SIZE as any}
      src={data?.url}
      style={{ height: isSafari ? 'auto' : '100%' }}
      wrapperClassName={cx(styles.image, editable && styles.editableImage)}
    />
  );
});

export default ImageFileItem;
