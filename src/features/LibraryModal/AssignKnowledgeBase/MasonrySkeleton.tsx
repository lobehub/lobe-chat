import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
  `,
  grid: css`
    display: grid;
    gap: 16px;
    padding-block: 12px;
  `,
}));

interface MasonrySkeletonProps {
  columnCount: number;
}

const MasonrySkeleton = memo<MasonrySkeletonProps>(({ columnCount }) => {
  const { styles } = useStyles();
  // Generate varying heights for more natural masonry look
  const heights = [160, 180, 170, 160, 190, 170, 160, 180];

  // Calculate number of items based on column count (max 2 columns for modal)
  const itemCount = Math.min(columnCount * 3, 8);

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      }}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <div className={styles.card} key={index}>
          <Skeleton
            active
            avatar={{ shape: 'square', size: 48 }}
            paragraph={{
              rows: 3,
              width: ['100%', '90%', '70%'],
            }}
            style={{
              height: heights[index % heights.length],
            }}
            title={{
              width: '80%',
            }}
          />
        </div>
      ))}
    </div>
  );
});

MasonrySkeleton.displayName = 'MasonrySkeleton';

export default MasonrySkeleton;
