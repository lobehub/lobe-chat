import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorSplit};
    border-radius: 8px;
  `,
}));

const ErrorActionContainer = memo<{ children: ReactNode }>(({ children }) => {
  const { styles } = useStyles();

  return (
    <Center className={styles.container} gap={24} padding={24}>
      {children}
    </Center>
  );
});

export default ErrorActionContainer;
