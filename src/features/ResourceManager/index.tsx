'use client';

import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/store';

import FileExplorer from './FileExplorer';
import DocumentExplorer from './PageExplorer';
import PageEditor from './PageExplorer/PageEditor';
import UploadDock from './UploadDock';

const ChunkDrawer = dynamic(() => import('./ChunkDrawer'), { ssr: false });

export type ResouceManagerMode = 'page' | 'pages' | 'files' | 'file';

interface KnowledgeManagerProps {
  category?: string;
  // Directly open a document if provided
  documentId?: string;
  knowledgeBaseId?: string;
  onOpenFile?: (id: string) => void;
  title: string;
}

/**
 * Manage knowledge items. Can be all items or certian repo.
 *
 * DocumentExplorer: For the "pages" category.
 * Home: For the "home" category.
 * FileExplorer: For other categories.
 */
const ResourceManager = memo<KnowledgeManagerProps>(
  ({ knowledgeBaseId, category, onOpenFile, documentId }) => {
    const mode = useResourceManagerStore((s) => s.mode);

    const MainContent = useMemo(() => {
      switch (mode) {
        case 'page': {
          return <PageEditor documentId={documentId} knowledgeBaseId={knowledgeBaseId} />;
        }
        case 'pages': {
          return <DocumentExplorer documentId={documentId} knowledgeBaseId={knowledgeBaseId} />;
        }
        case 'files':
        case 'file': {
          return (
            <FileExplorer
              category={category}
              knowledgeBaseId={knowledgeBaseId}
              onOpenFile={onOpenFile}
            />
          );
        }
      }
    }, [mode, documentId, knowledgeBaseId, category, onOpenFile]);

    return (
      <>
        <Flexbox gap={12} height={'100%'}>
          {MainContent}
        </Flexbox>
        <UploadDock />
        <ChunkDrawer />
      </>
    );
  },
);

export default ResourceManager;
