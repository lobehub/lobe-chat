'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { FilesTabs } from '@/types/files';

import FileExplorer from './FileExplorer';
import Home from './Home';
import DocumentExplorer from './PageExplorer';
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
 * Manage knowledge items. Can be all items or certian repo.
 *
 * DocumentExplorer: For the "pages" category.
 * Home: For the "home" category.
 * FileExplorer: For other categories.
 */
const KnowledgeManager = memo<KnowledgeManagerProps>(
  ({ knowledgeBaseId, category, onOpenFile, documentId }) => {
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
        <Flexbox gap={12} height={'100%'}>
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
