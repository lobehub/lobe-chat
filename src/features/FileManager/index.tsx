'use client';

import { Text } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { FilesTabs } from '@/types/files';

import DocumentExplorer from './DocumentExplorer/DocumentExplorer';
import FileList from './FileList';
import Header from './Header';
import Home from './Home';
import UploadDock from './UploadDock';

const ChunkDrawer = dynamic(() => import('./ChunkDrawer'), { ssr: false });

interface FileManagerProps {
  category?: string;
  knowledgeBaseId?: string;
  onOpenFile: (id: string) => void;
  title: string;
}

/**
 * Documents View is a special view.
 * Home View is shown for the "home" category.
 * For other categories, it will show the file list.
 */
const KnowledgeItemManager = memo<FileManagerProps>(
  ({ title, knowledgeBaseId, category, onOpenFile }) => {
    const isDocumentsView = category === FilesTabs.Documents;
    const isHomeView = category === FilesTabs.Home;

    return (
      <>
        {!isDocumentsView && !isHomeView && <Header knowledgeBaseId={knowledgeBaseId} />}
        <Flexbox gap={12} height={'100%'}>
          {!isDocumentsView && !isHomeView && (
            <Text strong style={{ fontSize: 16, marginBlock: 16, marginInline: 24 }}>
              {title}
            </Text>
          )}
          {isDocumentsView ? (
            <DocumentExplorer knowledgeBaseId={knowledgeBaseId} />
          ) : isHomeView ? (
            <Home knowledgeBaseId={knowledgeBaseId} onOpenFile={onOpenFile} />
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
