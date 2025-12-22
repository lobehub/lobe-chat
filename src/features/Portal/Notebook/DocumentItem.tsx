import { NotebookDocument } from '@lobechat/types';
import { ActionIcon, Flexbox, Text } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { FileTextIcon, Trash2Icon } from 'lucide-react';
import { MouseEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { useNotebookStore } from '@/store/notebook';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    cursor: pointer;
    padding: 12px;
    border-radius: 8px;
    background: ${token.colorFillTertiary};

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
  description: css`
    font-size: 12px;
    line-height: 1.5;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    font-weight: 500;
  `,
}));

interface DocumentItemProps {
  document: NotebookDocument;
  topicId: string;
}

const DocumentItem = memo<DocumentItemProps>(({ document, topicId }) => {
  const { t } = useTranslation('portal');
  const { styles } = useStyles();
  const { modal } = App.useApp();
  const [deleting, setDeleting] = useState(false);

  const openDocument = useChatStore((s) => s.openDocument);
  const deleteDocument = useNotebookStore((s) => s.deleteDocument);

  const handleClick = () => {
    openDocument(document.id);
  };

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation();

    modal.confirm({
      centered: true,
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleting(true);
        try {
          await deleteDocument(document.id, topicId);
        } finally {
          setDeleting(false);
        }
      },
      title: t('notebook.confirmDelete'),
    });
  };

  return (
    <Flexbox className={styles.container} gap={8} horizontal onClick={handleClick}>
      <FileTextIcon size={16} />
      <Flexbox gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Flexbox align={'center'} distribution={'space-between'} horizontal>
          <Text className={styles.title} ellipsis>
            {document.title}
          </Text>
          <ActionIcon
            icon={Trash2Icon}
            loading={deleting}
            onClick={handleDelete}
            size={'small'}
            title={t('notebook.delete')}
          />
        </Flexbox>
        {document.description && (
          <Text className={styles.description} ellipsis={{ rows: 2 }}>
            {document.description}
          </Text>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default DocumentItem;
