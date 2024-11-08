import { ActionIcon, Icon, copyToClipboard } from '@lobehub/ui';
import { App, Dropdown } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import {
  BookMinusIcon,
  BookPlusIcon,
  DownloadIcon,
  LinkIcon,
  MoreHorizontalIcon,
  Trash,
} from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAddFilesToKnowledgeBaseModal } from '@/features/KnowledgeBaseModal';
import { useFileStore } from '@/store/file';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { downloadFile } from '@/utils/client/downloadFile';

interface DropdownMenuProps {
  filename: string;
  id: string;
  knowledgeBaseId?: string;
  url: string;
}

const DropdownMenu = memo<DropdownMenuProps>(({ id, knowledgeBaseId, url, filename }) => {
  const { t } = useTranslation(['components', 'common']);
  const { message, modal } = App.useApp();

  const [removeFile] = useFileStore((s) => [s.removeFileItem]);
  const [removeFilesFromKnowledgeBase] = useKnowledgeBaseStore((s) => [
    s.removeFilesFromKnowledgeBase,
  ]);

  const inKnowledgeBase = !!knowledgeBaseId;
  const { open } = useAddFilesToKnowledgeBaseModal();

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
              content: t('FileManager.actions.confirmDelete'),
              okButtonProps: { danger: true },
              onOk: async () => {
                await removeFile(id);
              },
            });
          },
        },
      ] as ItemType[]
    ).filter(Boolean);
  }, [inKnowledgeBase]);
  return (
    <Dropdown menu={{ items }}>
      <ActionIcon icon={MoreHorizontalIcon} size={'small'} />
    </Dropdown>
  );
});

export default DropdownMenu;
