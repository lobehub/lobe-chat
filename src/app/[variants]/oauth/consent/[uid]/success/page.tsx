'use client';

import { Icon } from '@lobehub/ui';
import { Card, Result } from 'antd';
import { CheckCircle } from 'lucide-react';
import React from 'react';
import { Center } from 'react-layout-kit';

const SuccessPage = () => {
  return (
    <Center height="100vh">
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <Result
          icon={<Icon icon={CheckCircle} />}
          status="success"
          style={{ padding: 0 }}
          subTitle="您已成功授权应用访问您的 LobeChat 账户，可以关闭该页面了"
          title="授权成功"
        />
      </Card>
    </Center>
  );
};

export default SuccessPage;
