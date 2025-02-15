'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 16px;
    border-radius: 8px;
    background: ${token.colorBgContainer};
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
