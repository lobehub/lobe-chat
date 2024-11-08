'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 16px;
    background: ${token.colorBgContainer};
    border-radius: 8px;
  `,
}));

const Container = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container} height={'100%'}>
      {children}
    </Flexbox>
  );
};

export default Container;
