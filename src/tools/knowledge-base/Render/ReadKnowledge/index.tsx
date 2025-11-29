import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ReadKnowledgeArgs } from '../../ExecutionRuntime';
import { ReadKnowledgeState } from '../../type';
import FileCard from './FileCard';

const ReadKnowledge = memo<BuiltinRenderProps<ReadKnowledgeArgs, ReadKnowledgeState>>(
  ({ pluginState }) => {
    const { files } = pluginState || {};

    if (!files || files.length === 0) {
      return null;
    }

    return (
      <Flexbox gap={12} horizontal style={{ flexWrap: 'wrap' }}>
        {files.map((file) => (
          <FileCard file={file} key={file.fileId} />
        ))}
      </Flexbox>
    );
  },
);

export default ReadKnowledge;
