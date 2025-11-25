import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SearchKnowledgeBaseArgs, SearchKnowledgeBaseState } from '@/tools/knowledge-base/type';

import FileItem from './Item';

const SearchKnowledgeBase = memo<
  BuiltinRenderProps<SearchKnowledgeBaseArgs, SearchKnowledgeBaseState>
>(({ pluginState }) => {
  const { fileResults } = pluginState || {};

  return (
    <Flexbox gap={8} horizontal wrap={'wrap'}>
      {fileResults?.map((file, index) => {
        return <FileItem index={index} key={file.fileId} {...file} />;
      })}
    </Flexbox>
  );
});

export default SearchKnowledgeBase;
