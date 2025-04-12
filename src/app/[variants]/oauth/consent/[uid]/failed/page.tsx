'use client';

import { Icon } from '@lobehub/ui';
import { Button, Card, Result } from 'antd';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Center } from 'react-layout-kit';

/**
 * 授权失败页面
 */
const FailedPage = () => {
  return (
    <Center height="100vh">
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <Result
          extra={
            <Link href="/">
              <Button type="primary">返回首页</Button>
            </Link>
          }
          icon={<Icon icon={XCircle} />}
          status="error"
          style={{ padding: 0 }}
          subTitle="您已拒绝授权应用访问您的 LobeChat 账户"
          title="授权被拒绝"
        />
      </Card>
    </Center>
  );
};

export default FailedPage;
