'use client';

import { Text } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { FilesTabs } from '@/types/files';

import FileList from './FileList';
import Header from './Header';
import UploadDock from './UploadDock';
import DocumentExplorer from './components/NoteSplitView';

const ChunkDrawer = dynamic(() => import('./ChunkDrawer'), { ssr: false });

interface FileManagerProps {
  category?: string;
  knowledgeBaseId?: string;
  onOpenFile: (id: string) => void;
  title: string;
}

/**
 * Documents View is a special view.
 * For other categories, it will show the file list.
 */
const KnowledgeItemManager = memo<FileManagerProps>(
  ({ title, knowledgeBaseId, category, onOpenFile }) => {
    const isDocumentsView = category === FilesTabs.Documents;

    return (
      <>
        {!isDocumentsView && <Header knowledgeBaseId={knowledgeBaseId} />}
        <Flexbox gap={12} height={'100%'}>
          {!isDocumentsView && (
            <Text strong style={{ fontSize: 16, marginBlock: 16, marginInline: 24 }}>
              {title}
            </Text>
          )}
          {isDocumentsView ? (
            <DocumentExplorer knowledgeBaseId={knowledgeBaseId} />
          ) : (
            <FileList
              category={category}
              knowledgeBaseId={knowledgeBaseId}
              onOpenFile={onOpenFile}
            />
          )}
        </Flexbox>
        <UploadDock />
        <ChunkDrawer />
      </>
    );
  },
);

export default KnowledgeItemManager;
