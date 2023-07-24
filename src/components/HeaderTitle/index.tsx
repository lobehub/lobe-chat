import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  desc: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  title: css`
    font-size: 16px;
    font-weight: bold;
  `,
  titleWithDesc: css`
    font-weight: bold;
  `,
}));

export interface HeaderTitleProps {
  desc?: string | ReactNode;
  tag?: ReactNode;
  title: string | ReactNode;
}

const HeaderTitle = memo<HeaderTitleProps>(({ title, desc, tag }) => {
  const { styles } = useStyles();
  if (desc)
    return (
      <Flexbox>
        <Flexbox align={'center'} className={styles.titleWithDesc} gap={8} horizontal>
          {title}
          {tag}
        </Flexbox>
        <Flexbox align={'center'} className={styles.desc} horizontal>
          {desc}
        </Flexbox>
      </Flexbox>
    );
  return <div className={styles.title}>{title}</div>;
});

export default HeaderTitle;
