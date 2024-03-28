import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css }) => ({
  paragraph: css`
    height: 12px !important;
    margin-top: 12px !important;

    > li {
      height: 12px !important;
    }
  `,
  title: css`
    height: 14px !important;
    margin-top: 4px !important;
    margin-bottom: 12px !important;

    > li {
      height: 14px !important;
    }
  `,
}));

//  从 3~10 随机取一个整数

const SkeletonList = () => {
  const { styles } = useStyles();

  const list = Array.from({ length: 4 }).fill('');
  return (
    <Flexbox gap={8} paddingInline={16}>
      {list.map((_, index) => (
        <Skeleton
          active
          avatar
          key={index}
          paragraph={{ className: styles.paragraph, rows: 1 }}
          title={{ className: styles.title }}
        />
      ))}
    </Flexbox>
  );
};
export default SkeletonList;
