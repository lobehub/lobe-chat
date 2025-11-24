import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/knowledge/hooks/useFolderPath';
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

const FolderBreadcrumb = memo<FolderBreadcrumbProps>(({ knowledgeBaseId }) => {
  const { styles, cx } = useStyles();
  const navigate = useNavigate();
  const { folderSegments, knowledgeBaseId: currentKnowledgeBaseId } = useFolderPath();

  const baseKnowledgeBaseId = knowledgeBaseId || currentKnowledgeBaseId;
  const knowledgeBaseName = useKnowledgeBaseStore(
    knowledgeBaseSelectors.getKnowledgeBaseNameById(baseKnowledgeBaseId || ''),
  );

  if (!baseKnowledgeBaseId) {
    return null;
  }

  const handleNavigate = (index: number) => {
    if (index === -1) {
      // Navigate to knowledge base root
      navigate(`/knowledge/bases/${baseKnowledgeBaseId}`);
    } else {
      // Navigate to specific folder level
      const path = folderSegments.slice(0, index + 1).join('/');
      navigate(`/knowledge/bases/${baseKnowledgeBaseId}/${path}`);
    }
  };

  const isAtRoot = folderSegments.length === 0;

  return (
    <Flexbox align={'center'} className={styles.breadcrumb} gap={0} horizontal>
      <span
        className={cx(styles.breadcrumbItem, isAtRoot && styles.currentItem)}
        onClick={() => !isAtRoot && handleNavigate(-1)}
        style={{ cursor: isAtRoot ? 'default' : 'pointer' }}
      >
        {knowledgeBaseName || 'Knowledge Base'}
      </span>

      {folderSegments.map((segment, index) => {
        const isLast = index === folderSegments.length - 1;
        return (
          <Flexbox align={'center'} gap={0} horizontal key={index}>
            <span className={styles.separator}>/</span>
            <span
              className={cx(styles.breadcrumbItem, isLast && styles.currentItem)}
              onClick={() => !isLast && handleNavigate(index)}
              style={{ cursor: isLast ? 'default' : 'pointer' }}
            >
              {segment}
            </span>
          </Flexbox>
        );
      })}
    </Flexbox>
  );
});

FolderBreadcrumb.displayName = 'FolderBreadcrumb';

export default FolderBreadcrumb;
