import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAddFilesToKnowledgeBaseModal } from '@/features/LibraryModal';
import { useFileStore } from '@/store/file';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';

import type { MultiSelectActionType } from '../ToolBar/MultiSelectActions';

export const useFileExplorerActions = (
  selectFileIds: string[],
  setSelectedFileIds: (ids: string[]) => void,
  knowledgeBaseId?: string,
) => {
  const navigate = useNavigate();

  const [removeFiles, parseFilesToChunks, fileList] = useFileStore((s) => [
    s.removeFiles,
    s.parseFilesToChunks,
    s.fileList,
  ]);
  const [removeFromKnowledgeBase, removeKnowledgeBase] = useKnowledgeBaseStore((s) => [
    s.removeFilesFromKnowledgeBase,
    s.removeKnowledgeBase,
  ]);

  const { open: openAddModal } = useAddFilesToKnowledgeBaseModal();

  const onActionClick = useCallback(
    async (type: MultiSelectActionType) => {
      switch (type) {
        case 'delete': {
          await removeFiles(selectFileIds);
          setSelectedFileIds([]);
          return;
        }
        case 'removeFromKnowledgeBase': {
          if (!knowledgeBaseId) return;
          await removeFromKnowledgeBase(knowledgeBaseId, selectFileIds);
          setSelectedFileIds([]);
          return;
        }
        case 'addToKnowledgeBase': {
          openAddModal({
            fileIds: selectFileIds,
            onClose: () => setSelectedFileIds([]),
          });
          return;
        }
        case 'addToOtherKnowledgeBase': {
          openAddModal({
            fileIds: selectFileIds,
            knowledgeBaseId,
            onClose: () => setSelectedFileIds([]),
          });
          return;
        }
        case 'batchChunking': {
          const chunkableFileIds = selectFileIds.filter((id) => {
            const file = fileList.find((f) => f.id === id);
            return file && !isChunkingUnsupported(file.fileType);
          });
          await parseFilesToChunks(chunkableFileIds, { skipExist: true });
          setSelectedFileIds([]);
          return;
        }
        case 'deleteLibrary': {
          if (!knowledgeBaseId) return;
          await removeKnowledgeBase(knowledgeBaseId);
          navigate('/knowledge');
          return;
        }
      }
    },
    [
      selectFileIds,
      knowledgeBaseId,
      removeFiles,
      removeFromKnowledgeBase,
      removeKnowledgeBase,
      parseFilesToChunks,
      fileList,
      openAddModal,
      setSelectedFileIds,
      navigate,
    ],
  );

  return {
    onActionClick,
  };
};
