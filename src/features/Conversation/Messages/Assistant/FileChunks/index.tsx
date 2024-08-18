import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatFileChunk } from '@/types/message';

import ChunkItem from './Item';

interface FileChunksProps {
  data: ChatFileChunk[];
}

const FileChunks = memo<FileChunksProps>(({ data }) => {
  return (
    <Flexbox gap={4}>
      <Flexbox>引用源</Flexbox>
      <Flexbox gap={8} horizontal wrap={'wrap'}>
        {data.map((item, index) => {
          return <ChunkItem index={index} key={item.id} {...item}></ChunkItem>;
        })}
      </Flexbox>
    </Flexbox>
  );
});

export default FileChunks;
