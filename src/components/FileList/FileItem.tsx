import { ActionIcon, Icon } from '@lobehub/ui';
import { Image, Skeleton } from 'antd';
import { LucideImageOff, Trash } from 'lucide-react';
import { CSSProperties, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';

import { MIN_IMAGE_SIZE, useStyles } from './FileItem.style';

interface FileItemProps {
  alwaysShowClose?: boolean;
  className?: string;
  editable: boolean;
  id: string;
  onClick?: () => void;
  style?: CSSProperties;
}
const FileItem = memo<FileItemProps>(
  ({ editable, id, onClick, alwaysShowClose, className, style }) => {
    const { styles, cx } = useStyles(editable);
    const [useFetchFile, removeFile] = useFileStore((s) => [s.useFetchFile, s.removeFile]);
    const IMAGE_SIZE = editable ? MIN_IMAGE_SIZE : '100%';
    const { data, isLoading } = useFetchFile(id);

    return (
      <Flexbox className={cx(styles.container, className)} onClick={onClick} style={style}>
        {isLoading ? (
          <Skeleton.Image
            active
            style={{ borderRadius: 8, height: IMAGE_SIZE, width: IMAGE_SIZE }}
          />
        ) : (
          <div className={styles.imageWrapper}>
            {data ? (
              <Image
                alt={data.name || ''}
                fetchPriority={'high'}
                loading={'lazy'}
                preview={{
                  styles: { mask: { backdropFilter: 'blur(2px)' } },
                }}
                src={data.url}
                wrapperClassName={styles.image}
              />
            ) : (
              <Center className={styles.notFound} height={'100%'}>
                <Icon icon={LucideImageOff} size={{ fontSize: 28 }} />
              </Center>
            )}
          </div>
        )}
        {/* only show close icon when editable */}
        {editable && (
          <Center
            className={cx(styles.closeIcon, alwaysShowClose && styles.alwaysShowClose)}
            onClick={(e) => {
              e.stopPropagation();

              removeFile(id);
            }}
          >
            <ActionIcon
              active
              color={'#fff'}
              glass
              icon={Trash}
              size={{ blockSize: 24, fontSize: 16 }}
            />
          </Center>
        )}
      </Flexbox>
    );
  },
);

export default FileItem;
