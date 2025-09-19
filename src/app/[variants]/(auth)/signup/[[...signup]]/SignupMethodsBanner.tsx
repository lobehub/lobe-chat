'use client';

import { Icon } from '@lobehub/ui';
import { Alert, Space, Tag } from 'antd';
import { Chrome, Mail } from 'lucide-react';
import React from 'react';

/**
 * A small visual banner rendered above the Clerk <SignUp /> widget, confirming
 * that Email and Google sign-in methods are enabled for this deployment.
 *
 * Style intent: lightweight, consistent with existing Ant Design usage across the app.
 */
const SignupMethodsBanner: React.FC = () => {
  return (
    <div style={{ margin: '0 auto 16px', maxWidth: 560 }}>
      <Alert
        description={
          <Space size="small" wrap>
            <span>Available sign-in options:</span>
            <Tag color="green">
              <Space size={6}>
                <Icon icon={Mail} />
                <span>Email</span>
              </Space>
            </Tag>
            <Tag color="blue">
              <Space size={6}>
                <Icon icon={Chrome} />
                <span>Google</span>
              </Space>
            </Tag>
          </Space>
        }
        message="Authentication methods enabled"
        showIcon
        type="success"
      />
    </div>
  );
};

export default SignupMethodsBanner;
