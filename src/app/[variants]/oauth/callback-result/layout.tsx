'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren } from 'react';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    width: 100%;
    min-width: 400px;
    max-width: 480px;
    min-height: 320px;
    margin: 16px;
    padding: 32px;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};
  `,
}));

const DesktopCallbackLayout = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles();

  return (
    <Center height={'95vh'}>
      <div className={styles.card}>{children}</div>
    </Center>
  );
};

export default DesktopCallbackLayout;
