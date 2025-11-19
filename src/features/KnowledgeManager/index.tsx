'use client';

import { Text } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { FilesTabs } from '@/types/files';

import DocumentExplorer from './DocumentExplorer';
import FileExplorer from './FileExplorer';
import Header from './Header';
import Home from './Home';
import UploadDock from './UploadDock';

const ChunkDrawer = dynamic(() => import('./ChunkDrawer'), { ssr: false });

interface KnowledgeManagerProps {
  category?: string;
  // Directly open a document if provided
  documentId?: string;
  knowledgeBaseId?: string;
  onOpenFile: (id: string) => void;
  title: string;
}

/**
 * Manage knowledge items. Can be all items or certian knowledge base.
 *
 * DocumentExplorer: For the "documents" category.
 * Home: For the "home" category.
 * FileExplorer: For other categories.
 */
const KnowledgeManager = memo<KnowledgeManagerProps>(
  ({ title, knowledgeBaseId, category, onOpenFile, documentId }) => {
    const isDocumentsView = category === FilesTabs.Pages;
    const isHomeView = category === FilesTabs.Home;

    if (isHomeView) {
      return (
        <>
          <Home knowledgeBaseId={knowledgeBaseId} onOpenFile={onOpenFile} />
          <UploadDock />
          <ChunkDrawer />
        </>
      );
    }

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
            <DocumentExplorer documentId={documentId} knowledgeBaseId={knowledgeBaseId} />
          ) : (
            <FileExplorer
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

export default KnowledgeManager;
