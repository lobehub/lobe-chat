'use client';

import { CaretDownFilled } from '@ant-design/icons';
import { ActionIcon, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { motion } from 'framer-motion';
import { FileText, FolderIcon, FolderOpenIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/knowledge/hooks/useFolderPath';
import FileIcon from '@/components/FileIcon';
import { fileService } from '@/services/file';

import TreeSkeleton from './TreeSkeleton';

const useStyles = createStyles(({ css, token }) => ({
  fileItem: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 8px;

    color: ${token.colorText};

    transition: background-color 0.2s;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }
  `,
  fileItemActive: css`
    background-color: ${token.colorFillSecondary};
  `,
  folderHeader: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 8px;

    color: ${token.colorTextSecondary};

    transition: background-color 0.2s;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }
  `,
  folderHeaderActive: css`
    color: ${token.colorText};
    background-color: ${token.colorFillSecondary};
  `,
}));

interface TreeItem {
  children?: TreeItem[];
  fileType: string;
  id: string;
  isFolder: boolean;
  name: string;
  slug?: string | null;
  sourceType?: string;
}

interface FileTreeProps {
  knowledgeBaseId: string;
}

// Recursive component to render folder tree
const FolderTreeItem = memo<{
  expandedFolders: Set<string>;
  item: TreeItem;
  knowledgeBaseId: string;
  level?: number;
  loadedFolders: Set<string>;
  onLoadFolder: (folderId: string) => Promise<void>;
  onToggleFolder: (folderId: string) => void;
  selectedKey: string | null;
}>(
  ({
    item,
    level = 0,
    expandedFolders,
    loadedFolders,
    onToggleFolder,
    onLoadFolder,
    selectedKey,
    knowledgeBaseId,
  }) => {
    const { styles, cx } = useStyles();
    const navigate = useNavigate();
    const { folderPath } = useFolderPath();

    const itemKey = item.slug || item.id;
    const isExpanded = expandedFolders.has(itemKey);
    const isActive = selectedKey === itemKey;

    const handleClick = useCallback(async () => {
      if (item.isFolder) {
        // Toggle folder expansion
        onToggleFolder(itemKey);

        // Load children if not already loaded
        if (!isExpanded && !loadedFolders.has(itemKey)) {
          await onLoadFolder(itemKey);
        }
      } else {
        // Open file modal
        const currentPath = folderPath
          ? `/knowledge/repo/${knowledgeBaseId}/${folderPath}`
          : `/knowledge/repo/${knowledgeBaseId}`;
        navigate(`${currentPath}?file=${itemKey}`);
      }
    }, [
      item.isFolder,
      itemKey,
      isExpanded,
      loadedFolders,
      onToggleFolder,
      onLoadFolder,
      folderPath,
      knowledgeBaseId,
      navigate,
    ]);

    const handleFolderNavigate = useCallback(() => {
      if (item.isFolder) {
        navigate(`/knowledge/repo/${knowledgeBaseId}/${itemKey}`);
      }
    }, [item.isFolder, knowledgeBaseId, itemKey, navigate]);

    return (
      <Flexbox gap={2}>
        <Flexbox
          align={'center'}
          className={cx(
            item.isFolder ? styles.folderHeader : styles.fileItem,
            isActive && (item.isFolder ? styles.folderHeaderActive : styles.fileItemActive),
          )}
          horizontal
          onClick={item.isFolder ? handleFolderNavigate : handleClick}
          style={{ paddingInlineStart: level * 16 + 8 }}
        >
          {item.isFolder ? (
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <ActionIcon
                icon={CaretDownFilled as any}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                size={'small'}
              />
            </motion.div>
          ) : (
            <div style={{ width: 24 }} />
          )}
          <Flexbox
            align={'center'}
            flex={1}
            gap={8}
            horizontal
            style={{ minHeight: 28, minWidth: 0 }}
          >
            {item.isFolder ? (
              <Icon icon={isExpanded ? FolderOpenIcon : FolderIcon} size={16} />
            ) : item.sourceType === 'document' ? (
              <Icon icon={FileText} size={16} />
            ) : (
              <FileIcon fileName={item.name} fileType={item.fileType} size={16} />
            )}
            <span
              style={{
                flex: 1,
                fontSize: 14,
                lineHeight: '20px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </span>
          </Flexbox>
        </Flexbox>

        {item.isFolder && isExpanded && item.children && item.children.length > 0 && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            initial={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Flexbox gap={2}>
              {item.children.map((child) => (
                <FolderTreeItem
                  expandedFolders={expandedFolders}
                  item={child}
                  key={child.id}
                  knowledgeBaseId={knowledgeBaseId}
                  level={level + 1}
                  loadedFolders={loadedFolders}
                  onLoadFolder={onLoadFolder}
                  onToggleFolder={onToggleFolder}
                  selectedKey={selectedKey}
                />
              ))}
            </Flexbox>
          </motion.div>
        )}
      </Flexbox>
    );
  },
);

FolderTreeItem.displayName = 'FolderTreeItem';

const FileTree = memo<FileTreeProps>(({ knowledgeBaseId }) => {
  const { currentFolderSlug } = useFolderPath();

  const [items, setItems] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loadedFolders, setLoadedFolders] = useState<Set<string>>(new Set());

  // Sort items: folders first, then files
  const sortItems = useCallback((items: TreeItem[]): TreeItem[] => {
    return [...items].sort((a, b) => {
      // Folders first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      // Then alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Fetch root level data
  useEffect(() => {
    const fetchRootData = async () => {
      setLoading(true);
      try {
        const data = await fileService.getKnowledgeItems({
          knowledgeBaseId,
          parentId: null,
          showFilesInKnowledgeBase: false,
        });

        const mappedItems = data.map((item) => ({
          children: undefined,
          fileType: item.fileType,
          id: item.id,
          isFolder: item.fileType === 'custom/folder',
          name: item.name,
          slug: item.slug,
          sourceType: item.sourceType,
        }));

        setItems(sortItems(mappedItems));
      } catch (error) {
        console.error('Failed to load root files:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRootData();
  }, [knowledgeBaseId, sortItems]);

  const handleLoadFolder = useCallback(
    async (folderId: string) => {
      if (loadedFolders.has(folderId)) return;

      try {
        const data = await fileService.getKnowledgeItems({
          knowledgeBaseId,
          parentId: folderId,
          showFilesInKnowledgeBase: false,
        });

        const childItems: TreeItem[] = data.map((item) => ({
          children: undefined,
          fileType: item.fileType,
          id: item.id,
          isFolder: item.fileType === 'custom/folder',
          name: item.name,
          slug: item.slug,
          sourceType: item.sourceType,
        }));

        // Sort children: folders first, then files
        const sortedChildren = sortItems(childItems);

        setItems((prevItems) => {
          const updateItem = (items: TreeItem[]): TreeItem[] => {
            return items.map((item) => {
              const itemKey = item.slug || item.id;
              if (itemKey === folderId) {
                return { ...item, children: sortedChildren };
              }
              if (item.children) {
                return { ...item, children: updateItem(item.children) };
              }
              return item;
            });
          };
          return updateItem(prevItems);
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

  if (loading) {
    return <TreeSkeleton />;
  }

  return (
    <Flexbox gap={2}>
      {items.map((item) => (
        <FolderTreeItem
          expandedFolders={expandedFolders}
          item={item}
          key={item.id}
          knowledgeBaseId={knowledgeBaseId}
          loadedFolders={loadedFolders}
          onLoadFolder={handleLoadFolder}
          onToggleFolder={handleToggleFolder}
          selectedKey={currentFolderSlug}
        />
      ))}
    </Flexbox>
  );
});

FileTree.displayName = 'FileTree';

export default FileTree;
