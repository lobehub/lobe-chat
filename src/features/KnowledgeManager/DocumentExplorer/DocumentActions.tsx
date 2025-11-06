import { ActionIcon, Dropdown, Icon } from '@lobehub/ui';
import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(false);
    const removeDocument = useFileStore((s) => s.removeDocument);

    const handleDelete = async () => {
      setLoading(true);
      try {
        await removeDocument(documentId);
        onDelete?.();
      } catch (error) {
        console.error('Failed to delete document:', error);
      } finally {
        setLoading(false);
      }
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
                label: t('copy'),
                onClick: handleCopy,
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
          <ActionIcon icon={MoreHorizontal} loading={loading} size="small" />
        </Dropdown>
      </Flexbox>
    );
  },
);

export default DocumentActions;
