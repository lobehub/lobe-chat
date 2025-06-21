'use client';

import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { Center } from 'react-layout-kit';

interface ClientProps {
  error: {
    message: string;
    title: string;
  };
}

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    width: 100%;
    min-height: 100vh;
    color: ${token.colorTextBase};
    background-color: ${token.colorBgLayout};
  `,
  error: css`
    text-align: center;
  `,
}));

const ConsentClientError = memo<ClientProps>(({ error }) => {
  const { styles } = useStyles();

  return (
    <Center className={styles.container}>
      <div className={styles.error}>
        <Text as={'h2'} style={{ color: 'inherit' }}>
          {error.title}
        </Text>
        <Text style={{ color: 'inherit' }}>{error.message}</Text>
      </div>
    </Center>
  );
});

ConsentClientError.displayName = 'ConsentClientError';

export default ConsentClientError;
