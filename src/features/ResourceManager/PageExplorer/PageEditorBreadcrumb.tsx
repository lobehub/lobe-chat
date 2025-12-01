import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/knowledgeBase';

const useStyles = createStyles(({ css, token }) => ({
  breadcrumb: css`
    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,
  breadcrumbItem: css`
    cursor: pointer;
    transition: color ${token.motionDurationSlow};

    &:hover {
      color: ${token.colorText};
    }
  `,
  currentItem: css`
    font-weight: 500;
    color: ${token.colorText};
  `,
  separator: css`
    margin-inline: 8px;
    color: ${token.colorTextQuaternary};
  `,
}));

interface PageEditorBreadcrumbProps {
  documentTitle: string;
  knowledgeBaseId?: string;
  parentId: string;
}

interface FolderCrumb {
  id: string;
  name: string;
  slug: string;
}

const PageEditorBreadcrumb = memo<PageEditorBreadcrumbProps>(
  ({ documentTitle, knowledgeBaseId, parentId }) => {
    const { styles, cx } = useStyles();
    // const { t } = useTranslation('file');

    const knowledgeBaseName = useKnowledgeBaseStore(
      knowledgeBaseSelectors.getKnowledgeBaseNameById(knowledgeBaseId || ''),
    );

    // Fetch the parent folder to get its slug
    const useFetchKnowledgeItem = useFileStore((s) => s.useFetchKnowledgeItem);
    const { data: parentFolder } = useFetchKnowledgeItem(parentId);

    // Fetch folder breadcrumb chain from backend using parent folder's slug
    const useFetchFolderBreadcrumb = useFileStore((s) => s.useFetchFolderBreadcrumb);
    const { data: folderChain = [] } = useFetchFolderBreadcrumb(parentFolder?.slug || null);

    // If no parent folder data yet, don't render
    if (!parentFolder) {
      return null;
    }

    return (
      <Flexbox align={'center'} className={styles.breadcrumb} flex={1} gap={0} horizontal>
        {/* Knowledge Base (root) */}
        {knowledgeBaseId && (
          <>
            <span className={styles.breadcrumbItem} style={{ cursor: 'default' }}>
              {knowledgeBaseName || 'Knowledge Base'}
            </span>
            <span className={styles.separator}>/</span>
          </>
        )}

        {/* Folder chain */}
        {folderChain.map((folder: FolderCrumb) => (
          <Flexbox align={'center'} gap={0} horizontal key={folder.id}>
            <span className={styles.breadcrumbItem} style={{ cursor: 'default' }}>
              {folder.name}
            </span>
            <span className={styles.separator}>/</span>
          </Flexbox>
        ))}

        {/* Current document title */}
        <span
          className={cx(styles.breadcrumbItem, styles.currentItem)}
          style={{ cursor: 'default' }}
        >
          {documentTitle}
        </span>
      </Flexbox>
    );
  },
);

PageEditorBreadcrumb.displayName = 'PageEditorBreadcrumb';

export default PageEditorBreadcrumb;
