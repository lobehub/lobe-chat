import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/resource/hooks/useFolderPath';
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

interface FolderBreadcrumbProps {
  knowledgeBaseId?: string;
}

interface FolderCrumb {
  id: string;
  name: string;
  slug: string;
}

const FolderBreadcrumb = memo<FolderBreadcrumbProps>(({ knowledgeBaseId }) => {
  const { styles, cx } = useStyles();
  const navigate = useNavigate();
  const { currentFolderSlug, knowledgeBaseId: currentKnowledgeBaseId } = useFolderPath();

  const baseKnowledgeBaseId = knowledgeBaseId || currentKnowledgeBaseId;
  const knowledgeBaseName = useKnowledgeBaseStore(
    knowledgeBaseSelectors.getKnowledgeBaseNameById(baseKnowledgeBaseId || ''),
  );

  // Fetch folder breadcrumb chain from backend
  const useFetchFolderBreadcrumb = useFileStore((s) => s.useFetchFolderBreadcrumb);
  const { data: folderChain = [] } = useFetchFolderBreadcrumb(currentFolderSlug);

  if (!baseKnowledgeBaseId) {
    return null;
  }

  const handleNavigate = (slug: string | null) => {
    if (slug) {
      navigate(`/knowledge/library/${baseKnowledgeBaseId}/${slug}`);
    } else {
      navigate(`/knowledge/library/${baseKnowledgeBaseId}`);
    }
  };

  const isAtRoot = folderChain.length === 0;

  return (
    <Flexbox align={'center'} className={styles.breadcrumb} gap={0} horizontal>
      <span
        className={cx(styles.breadcrumbItem, isAtRoot && styles.currentItem)}
        onClick={() => !isAtRoot && handleNavigate(null)}
        style={{ cursor: isAtRoot ? 'default' : 'pointer' }}
      >
        {knowledgeBaseName || 'Knowledge Base'}
      </span>

      {folderChain.map((folder: FolderCrumb, index: number) => {
        const isLast = index === folderChain.length - 1;
        return (
          <Flexbox align={'center'} gap={0} horizontal key={folder.id}>
            <span className={styles.separator}>/</span>
            <span
              className={cx(styles.breadcrumbItem, isLast && styles.currentItem)}
              onClick={() => !isLast && handleNavigate(folder.slug)}
              style={{ cursor: isLast ? 'default' : 'pointer' }}
            >
              {folder.name}
            </span>
          </Flexbox>
        );
      })}
    </Flexbox>
  );
});

FolderBreadcrumb.displayName = 'FolderBreadcrumb';

export default FolderBreadcrumb;
