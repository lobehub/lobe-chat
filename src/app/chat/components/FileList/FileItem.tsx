import { CloseCircleFilled } from '@ant-design/icons';
import { Icon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { LucideImageOff } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';

import { IMAGE_SIZE, useStyles } from './FileItem.style';

interface FileItemProps {
  alwaysShowClose?: boolean;
  editable: boolean;
  id: string;
  onClick: () => void;
}
const FileItem = memo<FileItemProps>(({ editable, id, onClick, alwaysShowClose }) => {
  const { styles, cx } = useStyles();
  const [useFetchFile, removeFile] = useFileStore((s) => [s.useFetchFile, s.removeFile]);

  const { data, isLoading } = useFetchFile(id);

  return (
    <Flexbox className={styles.container} onClick={onClick}>
      {isLoading ? (
        <Skeleton
          active
          title={{
            style: { borderRadius: 8, height: IMAGE_SIZE },
            width: IMAGE_SIZE,
          }}
        />
      ) : (
        <Flexbox className={styles.imageCtn}>
          <div className={styles.imageWrapper}>
            {data ? (
              <Image
                alt={data.name || ''}
                className={styles.image}
                fetchPriority={'high'}
                height={IMAGE_SIZE}
                loading={'lazy'}
                src={data.url}
                width={IMAGE_SIZE}
              />
            ) : (
              <Center className={styles.notFound} height={'100%'}>
                <Icon icon={LucideImageOff} size={{ fontSize: 28 }} />
              </Center>
            )}
          </div>
        </Flexbox>
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
          <CloseCircleFilled />
        </Center>
      )}
    </Flexbox>
  );
});

export default FileItem;
