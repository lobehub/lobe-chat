import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    position: relative;
    overflow: hidden;
    flex: 1;
    max-width: 100%;
  `,
  desc: css`
    overflow: hidden;

    width: 100%;

    font-size: 12px;
    color: ${token.colorTextTertiary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  tag: css`
    flex: none;
  `,
  title: css`
    overflow: hidden;

    font-size: 16px;
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  titleContainer: css`
    flex: 1;
  `,
  titleWithDesc: css`
    overflow: hidden;
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
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
      <Flexbox className={styles.container}>
        <Flexbox align={'center'} className={styles.titleContainer} gap={8} horizontal>
          <div className={styles.titleWithDesc}>{title}</div>
          <Flexbox className={styles.tag} horizontal>
            {tag}
          </Flexbox>
        </Flexbox>
        <Flexbox align={'center'} horizontal>
          <div className={styles.desc}>{desc}</div>
        </Flexbox>
      </Flexbox>
    );
  return (
    <Flexbox align={'center'} className={styles.container} gap={8} horizontal>
      <div className={styles.title}>{title}</div>
      <Flexbox className={styles.tag} horizontal>
        {tag}
      </Flexbox>
    </Flexbox>
  );
});

export default HeaderTitle;
