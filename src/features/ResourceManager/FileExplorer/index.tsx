'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import EmptyStatus from './EmptyStatus';
import Header from './Header';
import ListView from './ListView';
import Skeleton from './ListView/Skeleton';
import MasonryView from './MasonryView';
import PreviewMode from './PreviewMode';
import { useFileExplorer } from './useFileExplorer';

interface FileExplorerProps {
  category?: string;
  knowledgeBaseId?: string;
  onOpenFile?: (id: string) => void;
}

const FileExplorer = memo<FileExplorerProps>(({ knowledgeBaseId, category, onOpenFile }) => {
  const {
    // Data
    currentFile,
    currentViewItemId,
    data,
    isLoading,
    pendingRenameItemId,

    // State
    isMasonryReady,
    isTransitioning,
    selectFileIds,
    showEmptyStatus,
    viewMode,
    isFilePreviewMode,

    // Handlers
    handleBackToList,
    handleSelectionChange,
    onActionClick,
    setSelectedFileIds,
    setViewMode,
  } = useFileExplorer({ category, knowledgeBaseId });

  // File preview mode
  if (isFilePreviewMode && currentViewItemId) {
    return (
      <PreviewMode
        category={category}
        currentViewItemId={currentViewItemId}
        fileName={currentFile?.name}
        knowledgeBaseId={knowledgeBaseId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <Flexbox height={'100%'}>
      <Header
        category={category}
        knowledgeBaseId={knowledgeBaseId}
        onActionClick={onActionClick}
        onViewChange={setViewMode}
        selectCount={selectFileIds.length}
        viewMode={viewMode}
      />
      {showEmptyStatus ? (
        <EmptyStatus knowledgeBaseId={knowledgeBaseId} showKnowledgeBase={!knowledgeBaseId} />
      ) : isLoading || (viewMode === 'list' && isTransitioning) ? (
        <Skeleton />
      ) : viewMode === 'list' ? (
        <ListView
          data={data}
          knowledgeBaseId={knowledgeBaseId}
          onSelectionChange={handleSelectionChange}
          pendingRenameItemId={pendingRenameItemId}
          selectFileIds={selectFileIds}
        />
      ) : (
        <MasonryView
          data={data}
          isMasonryReady={isMasonryReady}
          isTransitioning={isTransitioning}
          knowledgeBaseId={knowledgeBaseId}
          onOpenFile={onOpenFile}
          selectFileIds={selectFileIds}
          setSelectedFileIds={setSelectedFileIds}
        />
      )}
    </Flexbox>
  );
});

export default FileExplorer;
