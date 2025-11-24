import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight, Folder, Home } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/knowledge/hooks/useFolderPath';

const useStyles = createStyles(({ css, token }) => ({
  breadcrumb: css`
    font-size: 12px;
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
    margin-inline: 4px;
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

  if (!baseKnowledgeBaseId || folderSegments.length === 0) {
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

  return (
    <Flexbox align={'center'} className={styles.breadcrumb} gap={0} horizontal>
      <Flexbox
        align={'center'}
        className={styles.breadcrumbItem}
        gap={4}
        horizontal
        onClick={() => handleNavigate(-1)}
      >
        <Icon icon={Home} size={14} />
        <span>Home</span>
      </Flexbox>

      {folderSegments.map((segment, index) => {
        const isLast = index === folderSegments.length - 1;
        return (
          <Flexbox align={'center'} gap={0} horizontal key={index}>
            <Icon className={styles.separator} icon={ChevronRight} size={12} />
            <Flexbox
              align={'center'}
              className={cx(styles.breadcrumbItem, isLast && styles.currentItem)}
              gap={4}
              horizontal
              onClick={() => !isLast && handleNavigate(index)}
              style={{ cursor: isLast ? 'default' : 'pointer' }}
            >
              <Icon icon={Folder} size={14} />
              <span>{segment}</span>
            </Flexbox>
          </Flexbox>
        );
      })}
    </Flexbox>
  );
});

FolderBreadcrumb.displayName = 'FolderBreadcrumb';

export default FolderBreadcrumb;
