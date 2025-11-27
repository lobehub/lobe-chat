import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  skeletonCard: css`
    display: flex;
    gap: 12px;
    align-items: center;

    min-height: 36px;
    margin-block: 4px;
    margin-inline: 8px;
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;

    background: transparent;
  `,
}));

const DocumentListSkeleton = () => {
  const { styles } = useStyles();

  return (
    <Flexbox>
      {Array.from({ length: 8 }).map((_, index) => (
        <div className={styles.skeletonCard} key={index}>
          {/* Icon skeleton */}
          <Skeleton.Avatar active shape="square" size={16} />
          {/* Title skeleton */}
          <Skeleton.Input active size="small" style={{ height: 20, minWidth: 120, width: 120 }} />
        </div>
      ))}
    </Flexbox>
  );
};

export default DocumentListSkeleton;
