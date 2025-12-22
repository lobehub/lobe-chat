'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { ListDocumentsArgs, ListDocumentsState } from '../../../types';
import DocumentCard from '../CreateDocument/DocumentCard';

export interface ListDocumentsRenderProps
  extends Pick<BuiltinRenderProps<ListDocumentsArgs, ListDocumentsState>, 'pluginState'> {
  labels?: {
    type?: string;
    words?: string;
  };
}

const ListDocuments = memo<ListDocumentsRenderProps>(({ pluginState, labels }) => {
  const { documents } = pluginState || {};

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <Flexbox gap={12} horizontal style={{ flexWrap: 'wrap' }}>
      {documents.map((document) => (
        <DocumentCard
          document={document}
          key={document.id}
          labels={{
            type: labels?.type || 'Type',
            words: labels?.words || 'Words',
          }}
        />
      ))}
    </Flexbox>
  );
});

export default ListDocuments;
