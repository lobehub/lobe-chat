import { ImageGallery } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MAX_SIZE_DESKTOP, MAX_SIZE_MOBILE } from '@/components/FileList/style';

import FileGrid from './FileGrid';
import FileItem from './FileItem';

interface FileListProps {
  items: string[];
}

const FileList = memo<FileListProps>(({ items }) => {
  const { mobile } = useResponsive();

  const { firstRow, lastRow } = useMemo(() => {
    if (items.length === 4) {
      return {
        firstRow: items.slice(0, 2),
        lastRow: items.slice(2, 4),
      };
    }

    const firstCol = items.length % 3 === 0 ? 3 : items.length % 3;

    return {
      firstRow: items.slice(0, firstCol),
      lastRow: items.slice(firstCol, items.length),
    };
  }, [items]);

  const { gap, max } = useMemo(
    () => ({
      gap: mobile ? 4 : 6,
      max: mobile ? MAX_SIZE_MOBILE : MAX_SIZE_DESKTOP,
    }),
    [mobile],
  );

  return (
    <ImageGallery>
      <Flexbox gap={gap}>
        <FileGrid col={firstRow.length} gap={gap} max={max}>
          {firstRow.map((i) => (
            <FileItem id={i} key={i} />
          ))}
        </FileGrid>
        {lastRow.length > 0 && (
          <FileGrid col={lastRow.length > 2 ? 3 : lastRow.length} gap={gap} max={max}>
            {lastRow.map((i) => (
              <FileItem id={i} key={i} />
            ))}
          </FileGrid>
        )}
      </Flexbox>
    </ImageGallery>
  );
});

export default FileList;
