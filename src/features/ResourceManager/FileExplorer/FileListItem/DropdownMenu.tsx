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

import { useAddFilesToKnowledgeBaseModal } from '@/features/LibraryModal';
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
  url: string;
}

const DropdownMenu = memo<DropdownMenuProps>(
  ({ id, knowledgeBaseId, url, filename, fileType, onRenameStart }) => {
    const { t } = useTranslation(['components', 'common']);
    const { message, modal } = App.useApp();

    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

    const [removeFile, refreshFileList] = useFileStore((s) => [
      s.removeFileItem,
      s.refreshFileList,
    ]);
    const [removeFilesFromKnowledgeBase] = useKnowledgeBaseStore((s) => [
      s.removeFilesFromKnowledgeBase,
    ]);

    const inKnowledgeBase = !!knowledgeBaseId;
    const { open } = useAddFilesToKnowledgeBaseModal();
    const isFolder = fileType === 'custom/folder';

    const items = useMemo(() => {
      const knowledgeBaseActions = (
        inKnowledgeBase
          ? [
              {
                icon: <Icon icon={BookPlusIcon} />,
                key: 'addToOtherKnowledgeBase',
                label: t('FileManager.actions.addToOtherKnowledgeBase'),
                onClick: async ({ domEvent }) => {
                  domEvent.stopPropagation();

                  open({ fileIds: [id], knowledgeBaseId });
                },
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
              {
                icon: <Icon icon={BookPlusIcon} />,
                key: 'addToKnowledgeBase',
                label: t('FileManager.actions.addToKnowledgeBase'),
                onClick: async ({ domEvent }) => {
                  domEvent.stopPropagation();
                  open({ fileIds: [id] });
                },
              },
            ]
      ) as ItemType[];

      return (
        [
          ...knowledgeBaseActions,
          {
            type: 'divider',
          },
          {
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
          {
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
              await downloadFile(url, filename);
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
    }, [inKnowledgeBase, isFolder]);

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
