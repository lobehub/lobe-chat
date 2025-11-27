import { Modal } from '@lobehub/ui';
import { App, Button } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FolderTree, { FolderTreeItem } from '@/features/ResourceManager/components/FolderTree';
import { fileService } from '@/services/file';
import { useFileStore } from '@/store/file';

interface MoveToFolderModalProps {
  fileId: string;
  knowledgeBaseId?: string;
  onClose: () => void;
  open: boolean;
}

const MoveToFolderModal = memo<MoveToFolderModalProps>(
  ({ open, onClose, fileId, knowledgeBaseId }) => {
    const { t } = useTranslation('components');
    const { message } = App.useApp();

    const [folders, setFolders] = useState<FolderTreeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [loadedFolders, setLoadedFolders] = useState<Set<string>>(new Set());

    const moveFileToFolder = useFileStore((s) => s.moveFileToFolder);

    // Sort items: folders only
    const sortItems = useCallback((items: FolderTreeItem[]): FolderTreeItem[] => {
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    // Fetch root level folders
    useEffect(() => {
      const fetchRootFolders = async () => {
        if (!open) return;

        setLoading(true);
        try {
          const data = await fileService.getKnowledgeItems({
            knowledgeBaseId,
            parentId: null,
            showFilesInKnowledgeBase: false,
          });

          // Filter only folders
          const folderItems = data
            .filter((item) => item.fileType === 'custom/folder')
            .map((item) => ({
              children: undefined,
              id: item.id,
              name: item.name,
              slug: item.slug,
            }));

          setFolders(sortItems(folderItems));
        } catch (error) {
          console.error('Failed to load folders:', error);
          setFolders([]);
        } finally {
          setLoading(false);
        }
      };

      fetchRootFolders();
    }, [open, knowledgeBaseId, sortItems]);

    const handleLoadFolder = useCallback(
      async (folderId: string) => {
        if (loadedFolders.has(folderId)) return;

        try {
          const data = await fileService.getKnowledgeItems({
            knowledgeBaseId,
            parentId: folderId,
            showFilesInKnowledgeBase: false,
          });

          // Filter only folders
          const childFolders: FolderTreeItem[] = data
            .filter((item) => item.fileType === 'custom/folder')
            .map((item) => ({
              children: undefined,
              id: item.id,
              name: item.name,
              slug: item.slug,
            }));

          const sortedChildren = sortItems(childFolders);

          setFolders((prevFolders) => {
            const updateFolder = (folders: FolderTreeItem[]): FolderTreeItem[] => {
              return folders.map((folder) => {
                const folderKey = folder.slug || folder.id;
                if (folderKey === folderId) {
                  return { ...folder, children: sortedChildren };
                }
                if (folder.children) {
                  return { ...folder, children: updateFolder(folder.children) };
                }
                return folder;
              });
            };
            return updateFolder(prevFolders);
          });

          setLoadedFolders((prev) => new Set([...prev, folderId]));
        } catch (error) {
          console.error('Failed to load folder contents:', error);
        }
      },
      [knowledgeBaseId, loadedFolders, sortItems],
    );

    const handleToggleFolder = useCallback((folderId: string) => {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(folderId)) {
          next.delete(folderId);
        } else {
          next.add(folderId);
        }
        return next;
      });
    }, []);

    const handleFolderClick = useCallback((folderId: string, folderSlug?: string | null) => {
      // Always use the document ID, not the slug
      setSelectedFolderId(folderId);
    }, []);

    const handleMove = async () => {
      try {
        await moveFileToFolder(fileId, selectedFolderId);
        message.success(t('FileManager.actions.moveSuccess'));
        onClose();
      } catch (error) {
        console.error('Failed to move file:', error);
        message.error(t('FileManager.actions.moveError'));
      }
    };

    const handleMoveToRoot = async () => {
      try {
        await moveFileToFolder(fileId, null);
        message.success(t('FileManager.actions.moveSuccess'));
        onClose();
      } catch (error) {
        console.error('Failed to move file:', error);
        message.error(t('FileManager.actions.moveError'));
      }
    };

    return (
      <Modal
        footer={
          <Flexbox gap={8} horizontal justify={'flex-end'}>
            <Button onClick={onClose}>{t('cancel', { ns: 'common' })}</Button>
            <Button onClick={handleMoveToRoot} type="default">
              {t('FileManager.actions.moveToRoot')}
            </Button>
            <Button disabled={!selectedFolderId} onClick={handleMove} type="primary">
              {t('FileManager.actions.moveHere')}
            </Button>
          </Flexbox>
        }
        onCancel={onClose}
        open={open}
        title={t('FileManager.actions.moveToFolder')}
      >
        <Flexbox style={{ maxHeight: 400, minHeight: 200, overflowY: 'auto' }}>
          {loading ? (
            <div>{t('loading', { ns: 'common' })}</div>
          ) : folders.length === 0 ? (
            <Flexbox align="center" justify="center" style={{ minHeight: 200 }}>
              <div style={{ color: 'var(--lobe-color-text-secondary)' }}>
                {t('FileManager.noFolders')}
              </div>
            </Flexbox>
          ) : (
            <FolderTree
              expandedFolders={expandedFolders}
              items={folders}
              loadedFolders={loadedFolders}
              onFolderClick={handleFolderClick}
              onLoadFolder={handleLoadFolder}
              onToggleFolder={handleToggleFolder}
              selectedKey={selectedFolderId}
            />
          )}
        </Flexbox>
      </Modal>
    );
  },
);

MoveToFolderModal.displayName = 'MoveToFolderModal';

export default MoveToFolderModal;
