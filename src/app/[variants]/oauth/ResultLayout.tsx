'use client';

import { Card } from 'antd';
import { createStyles } from 'antd-style';
import { type ReactNode, memo } from 'react';
import { Center } from 'react-layout-kit';

interface ResultLayoutProps {
  children: ReactNode;
}

const useStyles = createStyles(({ css, responsive }) => ({
  card: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 500px;
    min-height: 280px;

    ${responsive.mobile} {
      min-width: auto;
    }
  `,
  container: css`
    ${responsive.mobile} {
      justify-content: flex-start;
      width: 100%;
      padding-block-start: 64px;
    }
  `,
}));

const ResultLayout = memo<ResultLayoutProps>(({ children }) => {
  const { styles } = useStyles();

  return (
    <Center className={styles.container} height="100vh" paddingBlock={24} paddingInline={12}>
      <Card className={styles.card}>{children}</Card>
    </Center>
  );
});

ResultLayout.displayName = 'ResultLayout';

export default ResultLayout;
