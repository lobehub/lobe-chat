'use client';

import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { Center } from 'react-layout-kit';

interface ClientProps {
  error: {
    message: string;
    title: string;
  };
}

const { Title, Paragraph } = Typography;

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
        <Title level={2} style={{ color: 'inherit' }}>
          {error.title}
        </Title>
        <Paragraph style={{ color: 'inherit' }}>{error.message}</Paragraph>
      </div>
    </Center>
  );
});

ConsentClientError.displayName = 'ConsentClientError';

export default ConsentClientError;
