import { PreviewGroup } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileItem from '@/features/ChatInput/Mobile/FilePreview/FileItem';
import { filesSelectors, useFileStore } from '@/store/file';

const Files = memo(() => {
  const list = useFileStore(filesSelectors.chatUploadFileList, isEqual);

  if (!list || list?.length === 0) return null;

  return (
    <Flexbox paddingBlock={4} style={{ position: 'relative' }}>
      <Flexbox
        gap={4}
        horizontal
        padding={'4px 8px 8px'}
        style={{ overflow: 'scroll', width: '100%' }}
      >
        <PreviewGroup>
          {list.map((i) => (
            <FileItem {...i} key={i.id} loading={i.status === 'pending'} />
          ))}
        </PreviewGroup>
      </Flexbox>
    </Flexbox>
  );
});

export default Files;
