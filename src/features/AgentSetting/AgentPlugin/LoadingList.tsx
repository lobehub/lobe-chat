import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, prefixCls }) => ({
  avatar: css`
    .${prefixCls}-skeleton-header {
      padding-inline-end: 0;
    }
  `,
  label: css`
    li {
      height: 14px !important;
    }

    li + li {
      margin-block-start: 12px !important;
    }
  `,
}));

const LoadingList = () => {
  const { styles } = useStyles();

  const loadingItem = {
    avatar: (
      <Skeleton
        active
        avatar={{ size: 40 }}
        className={styles.avatar}
        paragraph={false}
        title={false}
      />
    ),
    label: (
      <Skeleton
        active
        avatar={false}
        paragraph={{ className: styles.label, style: { marginBottom: 0 } }}
        style={{ width: 300 }}
        title={false}
      />
    ),
  };

  return [loadingItem, loadingItem, loadingItem];
};

export default LoadingList;
