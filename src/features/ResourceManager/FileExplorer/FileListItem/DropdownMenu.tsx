import { ActionIcon, Dropdown, Icon, copyToClipboard } from '@lobehub/ui';
import { App } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import {
  BookMinusIcon,
  BookPlusIcon,
  DownloadIcon,
  FolderInputIcon,
  LinkIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash,
} from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import RepoIcon from '@/components/LibIcon';
import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { downloadFile } from '@/utils/client/downloadFile';

import MoveToFolderModal from '../MoveToFolderModal';

interface DropdownMenuProps {
  fileType: string;
  filename: string;
  id: string;
  knowledgeBaseId?: string;
  onRenameStart?: () => void;
  sourceType?: string;
  url: string;
}

const DropdownMenu = memo<DropdownMenuProps>(
  ({ id, knowledgeBaseId, url, filename, fileType, sourceType, onRenameStart }) => {
    const { t } = useTranslation(['components', 'common', 'knowledgeBase']);
    const { message, modal } = App.useApp();

    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

    const [removeFile, refreshFileList] = useFileStore((s) => [
      s.removeFileItem,
      s.refreshFileList,
    ]);
    const [removeFilesFromKnowledgeBase, addFilesToKnowledgeBase, useFetchKnowledgeBaseList] =
      useKnowledgeBaseStore((s) => [
        s.removeFilesFromKnowledgeBase,
        s.addFilesToKnowledgeBase,
        s.useFetchKnowledgeBaseList,
      ]);

    const { data: knowledgeBases } = useFetchKnowledgeBaseList();

    const inKnowledgeBase = !!knowledgeBaseId;
    const isFolder = fileType === 'custom/folder';
    const isPage = sourceType === 'document' || fileType === 'custom/document';

    const items = useMemo(() => {
      // Filter out current knowledge base and create submenu items
      const availableKnowledgeBases = (knowledgeBases || []).filter(
        (kb) => kb.id !== knowledgeBaseId,
      );

      const addToKnowledgeBaseSubmenu: ItemType[] = availableKnowledgeBases.map((kb) => ({
        icon: <RepoIcon />,
        key: `add-to-kb-${kb.id}`,
        label: <span style={{ marginLeft: 8 }}>{kb.name}</span>,
        onClick: async ({ domEvent }) => {
          domEvent.stopPropagation();
          try {
            await addFilesToKnowledgeBase(kb.id, [id]);
            message.success(
              t('addToKnowledgeBase.addSuccess', {
                count: 1,
                ns: 'knowledgeBase',
              }),
            );
          } catch (e) {
            console.error(e);
            message.error(t('addToKnowledgeBase.error', { ns: 'knowledgeBase' }));
          }
        },
      }));

      const knowledgeBaseActions = (
        inKnowledgeBase
          ? [
              availableKnowledgeBases.length > 0 && {
                children: addToKnowledgeBaseSubmenu,
                icon: <Icon icon={BookPlusIcon} />,
                key: 'addToOtherKnowledgeBase',
                label: t('FileManager.actions.addToOtherKnowledgeBase'),
              },
              {
                icon: <Icon icon={BookMinusIcon} />,
                key: 'removeFromKnowledgeBase',
                label: t('FileManager.actions.removeFromKnowledgeBase'),
                onClick: async ({ domEvent }) => {
                  domEvent.stopPropagation();

                  modal.confirm({
                    okButtonProps: {
                      danger: true,
                    },
                    onOk: async () => {
                      await removeFilesFromKnowledgeBase(knowledgeBaseId, [id]);

                      message.success(t('FileManager.actions.removeFromKnowledgeBaseSuccess'));
                    },
                    title: t('FileManager.actions.confirmRemoveFromKnowledgeBase', {
                      count: 1,
                    }),
                  });
                },
              },
            ]
          : [
              availableKnowledgeBases.length > 0 && {
                children: addToKnowledgeBaseSubmenu,
                icon: <Icon icon={BookPlusIcon} />,
                key: 'addToKnowledgeBase',
                label: t('FileManager.actions.addToKnowledgeBase'),
              },
            ]
      ) as ItemType[];

      return (
        [
          ...knowledgeBaseActions,
          {
            type: 'divider',
          },
          inKnowledgeBase && {
            icon: <Icon icon={FolderInputIcon} />,
            key: 'moveToFolder',
            label: t('FileManager.actions.moveToFolder'),
            onClick: async ({ domEvent }) => {
              domEvent.stopPropagation();
              setIsMoveModalOpen(true);
            },
          },
          isFolder && {
            icon: <Icon icon={PencilIcon} />,
            key: 'rename',
            label: t('FileManager.actions.rename'),
            onClick: async ({ domEvent }) => {
              domEvent.stopPropagation();
              onRenameStart?.();
            },
          },
          {
            icon: <Icon icon={LinkIcon} />,
            key: 'copyUrl',
            label: t('FileManager.actions.copyUrl'),
            onClick: async ({ domEvent }) => {
              domEvent.stopPropagation();
              await copyToClipboard(url);
              message.success(t('FileManager.actions.copyUrlSuccess'));
            },
          },
          !isFolder && {
            icon: <Icon icon={DownloadIcon} />,
            key: 'download',
            label: t('download', { ns: 'common' }),
            onClick: async ({ domEvent }) => {
              domEvent.stopPropagation();
              const key = 'file-downloading';
              message.loading({
                content: t('FileManager.actions.downloading'),
                duration: 0,
                key,
              });

              if (isPage) {
                // For pages, download as markdown
                try {
                  const doc = await documentService.getDocumentById(id);
                  if (doc?.content) {
                    // Create a blob with the markdown content
                    const blob = new Blob([doc.content], { type: 'text/markdown' });
                    const blobUrl = URL.createObjectURL(blob);

                    // Ensure filename has .md extension
                    const mdFilename = filename.endsWith('.md') ? filename : `${filename}.md`;

                    await downloadFile(blobUrl, mdFilename);
                    URL.revokeObjectURL(blobUrl);
                  } else {
                    message.error('Failed to download page: no content available');
                  }
                } catch (error) {
                  console.error('Failed to download page:', error);
                  message.error('Failed to download page');
                }
              } else {
                // For regular files, download from URL
                await downloadFile(url, filename);
              }

              message.destroy(key);
            },
          },
          {
            type: 'divider',
          },
          {
            danger: true,
            icon: <Icon icon={Trash} />,
            key: 'delete',
            label: t('delete', { ns: 'common' }),
            onClick: async ({ domEvent }) => {
              domEvent.stopPropagation();
              modal.confirm({
                content: isFolder
                  ? t('FileManager.actions.confirmDeleteFolder')
                  : t('FileManager.actions.confirmDelete'),
                okButtonProps: { danger: true },
                onOk: async () => {
                  if (isFolder) {
                    await documentService.deleteDocument(id);
                    await refreshFileList();
                  } else {
                    await removeFile(id);
                  }
                },
              });
            },
          },
        ] as ItemType[]
      ).filter(Boolean);
    }, [inKnowledgeBase, isFolder, knowledgeBases, knowledgeBaseId, id]);

    return (
      <>
        <Dropdown menu={{ items }}>
          <ActionIcon icon={MoreHorizontalIcon} size={'small'} />
        </Dropdown>
        <MoveToFolderModal
          fileId={id}
          knowledgeBaseId={knowledgeBaseId}
          onClose={() => setIsMoveModalOpen(false)}
          open={isMoveModalOpen}
        />
      </>
    );
  },
);

export default DropdownMenu;
