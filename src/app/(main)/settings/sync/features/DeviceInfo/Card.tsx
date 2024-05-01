import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    background: ${token.colorFillTertiary};
    border-radius: ${token.borderRadius}px;

    .${responsive.mobile} {
      width: 100%;
    }
  `,
  icon: css`
    width: 24px;
    height: 24px;
  `,
  title: css`
    font-size: 16px;
  `,
}));

const Card = memo<{ icon: ReactNode; title: string }>(({ title, icon }) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      flex={1}
      gap={12}
      horizontal
      paddingBlock={12}
      paddingInline={20}
    >
      <Center className={styles.icon}>{icon}</Center>
      <div className={styles.title}>{title}</div>
    </Flexbox>
  );
});

export default Card;
