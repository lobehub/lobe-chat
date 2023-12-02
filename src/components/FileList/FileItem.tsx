import { ActionIcon, Image } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Trash } from 'lucide-react';
import { CSSProperties, memo } from 'react';

import { useFileStore } from '@/store/file';

import { MIN_IMAGE_SIZE } from './style';

interface FileItemProps {
  alwaysShowClose?: boolean;
  className?: string;
  editable?: boolean;
  id: string;
  onClick?: () => void;
  style?: CSSProperties;
}
const FileItem = memo<FileItemProps>(({ editable, id, alwaysShowClose }) => {
  const theme = useTheme();
  const [useFetchFile, removeFile] = useFileStore((s) => [s.useFetchFile, s.removeFile]);
  const IMAGE_SIZE = editable ? MIN_IMAGE_SIZE : '100%';
  const { data, isLoading } = useFetchFile(id);

  return (
    <Image
      actions={
        editable && (
          <ActionIcon
            color={'#fff'}
            glass
            icon={Trash}
            onClick={(e) => {
              e.stopPropagation();
              removeFile(id);
            }}
            size={'small'}
            style={{
              background: theme.colorBgMask,
            }}
          />
        )
      }
      alt={data?.name || id || ''}
      alwaysShowActions={alwaysShowClose}
      isLoading={isLoading}
      size={IMAGE_SIZE as any}
      src={data?.url}
      style={
        editable
          ? {
              background: theme.colorBgContainer,
              border: `1px solid ${theme.colorBorderSecondary}`,
              marginBlock: 0,
            }
          : { marginBlock: 0 }
      }
    />
  );
});

export default FileItem;
