'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { CreateDocumentArgs, CreateDocumentState } from '../../../types';
import DocumentCard from './DocumentCard';

export interface CreateDocumentRenderProps
  extends Pick<BuiltinRenderProps<CreateDocumentArgs, CreateDocumentState>, 'pluginState'> {
  labels?: {
    type?: string;
    words?: string;
  };
}

const CreateDocument = memo<CreateDocumentRenderProps>(({ pluginState, labels }) => {
  const { document } = pluginState || {};

  if (!document) {
    return null;
  }

  return (
    <Flexbox gap={12} horizontal style={{ flexWrap: 'wrap' }}>
      <DocumentCard
        document={document}
        labels={{
          type: labels?.type || 'Type',
          words: labels?.words || 'Words',
        }}
      />
    </Flexbox>
  );
});

export default CreateDocument;
