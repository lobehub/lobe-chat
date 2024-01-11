import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, prefixCls }) => ({
  user: css`
    display: flex;
    flex-direction: row-reverse;
    gap: 16px;

    .${prefixCls}-skeleton-paragraph {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
  `,
}));
interface SkeletonListProps {
  mobile?: boolean;
}
const SkeletonList = memo<SkeletonListProps>(({ mobile }) => {
  const { styles } = useStyles();

  return (
    <Flexbox gap={24} padding={12} style={{ marginTop: 24 + (mobile ? 0 : 64) }}>
      <Skeleton
        active
        avatar={{ size: 40 }}
        className={styles.user}
        paragraph={{ width: ['50%', '30%'] }}
        title={false}
      />
      <Skeleton active avatar={{ size: 40 }} paragraph={{ width: ['50%', '30%'] }} title={false} />
    </Flexbox>
  );
});
export default SkeletonList;
