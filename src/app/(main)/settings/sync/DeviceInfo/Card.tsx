import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    background: ${token.colorFillTertiary};
    border-radius: 12px;

    .${responsive.mobile} {
      width: 100%;
    }
  `,
  icon: css`
    width: 40px;
    height: 40px;
  `,
  title: css`
    font-size: 20px;
  `,
}));

const Card = memo<{ icon: ReactNode; title: string }>(({ title, icon }) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      gap={12}
      horizontal
      paddingBlock={12}
      paddingInline={20}
    >
      <Center className={styles.icon}>{icon}</Center>
      <Flexbox className={styles.title}>{title}</Flexbox>
    </Flexbox>
  );
});

export default Card;
