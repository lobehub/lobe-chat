import { ActionIcon, Dropdown, Icon } from '@lobehub/ui';
import { App } from 'antd';
import { Copy, CopyPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';

interface DocumentActionsProps {
  documentContent?: string;
  documentId: string;
  onDelete?: () => void;
  onRename?: () => void;
}

const DocumentActions = memo<DocumentActionsProps>(
  ({ documentId, documentContent, onDelete, onRename }) => {
    const { t } = useTranslation(['common', 'file']);
    const { message, modal } = App.useApp();
    const [loading, setLoading] = useState(false);
    const removeDocument = useFileStore((s) => s.removeDocument);
    const duplicateDocument = useFileStore((s) => s.duplicateDocument);

    const handleDelete = () => {
      modal.confirm({
        cancelText: t('cancel'),
        content: t('documentEditor.deleteConfirm.content', { ns: 'file' }),
        okButtonProps: { danger: true },
        okText: t('delete'),
        onOk: async () => {
          setLoading(true);
          try {
            await removeDocument(documentId);
            message.success(t('documentEditor.deleteSuccess', { ns: 'file' }));
            onDelete?.();
          } catch (error) {
            console.error('Failed to delete document:', error);
            message.error(t('documentEditor.deleteError', { ns: 'file' }));
          } finally {
            setLoading(false);
          }
        },
        title: t('documentEditor.deleteConfirm.title', { ns: 'file' }),
      });
    };

    const handleCopy = async () => {
      if (documentContent) {
        try {
          await navigator.clipboard.writeText(documentContent);
        } catch (error) {
          console.error('Failed to copy document:', error);
        }
      }
    };

    const handleDuplicate = async () => {
      setLoading(true);
      try {
        await duplicateDocument(documentId);
      } catch (error) {
        console.error('Failed to duplicate document:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Flexbox align={'center'} horizontal onClick={(e) => e.stopPropagation()}>
        <Dropdown
          menu={{
            items: [
              {
                icon: <Icon icon={Pencil} />,
                key: 'rename',
                label: t('rename'),
                onClick: () => onRename?.(),
              },
              {
                icon: <Icon icon={Copy} />,
                key: 'copy',
                label: t('documentList.copyContent', { ns: 'file' }),
                onClick: handleCopy,
              },
              {
                icon: <Icon icon={CopyPlus} />,
                key: 'duplicate',
                label: t('documentList.duplicate', { ns: 'file' }),
                onClick: handleDuplicate,
              },
              {
                danger: true,
                icon: <Icon icon={Trash2} />,
                key: 'delete',
                label: t('delete'),
                onClick: handleDelete,
              },
            ],
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <ActionIcon icon={MoreHorizontal} loading={loading} size="small" variant="borderless" />
        </Dropdown>
      </Flexbox>
    );
  },
);

export default DocumentActions;
