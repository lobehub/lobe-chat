'use client';

import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import PageEditor from '@/features/PageEditor';

import Editor from './components/Editor';
import Explorer from './components/Explorer';
import UploadDock from './components/UploadDock';

const ChunkDrawer = dynamic(() => import('./components/ChunkDrawer'), { ssr: false });

export type ResouceManagerMode = 'editor' | 'explorer' | 'page';

/**
 * Manage resources. Can be from a certian library.
 *
 * Business component, no need be reusable.
 */
const ResourceManager = memo(() => {
  const theme = useTheme();
  const [mode, currentViewItemId, libraryId, setMode, setCurrentViewItemId] =
    useResourceManagerStore((s) => [
      s.mode,
      s.currentViewItemId,
      s.libraryId,
      s.setMode,
      s.setCurrentViewItemId,
    ]);

  const handleBack = () => {
    setMode('explorer');
    setCurrentViewItemId(undefined);
  };

  return (
    <>
      <Flexbox height={'100%'} style={{ position: 'relative' }}>
        {/* Explorer is always rendered to preserve its state */}
        <Explorer />

        {/* Editor overlay */}
        {mode === 'editor' && (
          <Flexbox
            height={'100%'}
            style={{
              backgroundColor: theme.colorBgLayout,
              inset: 0,
              position: 'absolute',
              zIndex: 1,
            }}
            width={'100%'}
          >
            <Editor />
          </Flexbox>
        )}

        {/* PageEditor overlay */}
        {mode === 'page' && (
          <Flexbox
            height={'100%'}
            style={{
              backgroundColor: theme.colorBgLayout,
              inset: 0,
              position: 'absolute',
              zIndex: 1,
            }}
            width={'100%'}
          >
            <PageEditor
              knowledgeBaseId={libraryId}
              onBack={handleBack}
              pageId={currentViewItemId}
            />
          </Flexbox>
        )}
      </Flexbox>
      <UploadDock />
      <ChunkDrawer />
    </>
  );
});

export default ResourceManager;
