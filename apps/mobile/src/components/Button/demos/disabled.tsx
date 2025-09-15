import React from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';

import { Button, Space } from '@/components';

const DisabledDemo = () => {
  return (
    <View>
      <Space size={[8, 16]} wrap>
        <Space>
          <Button type="primary">Primary</Button>
          <Button disabled type="primary">
            Primary(disabled)
          </Button>
        </Space>
        <Space>
          <Button type="default">Default</Button>
          <Button disabled type="default">
            Default(disabled)
          </Button>
        </Space>
        <Space>
          <Button type="dashed">Dashed</Button>
          <Button disabled type="dashed">
            Dashed(disabled)
          </Button>
        </Space>

        <Space>
          <Button type="text">Text</Button>
          <Button disabled type="text">
            Text(disabled)
          </Button>
        </Space>

        <Space>
          <Button type="link">Link</Button>
          <Button disabled type="link">
            Link(disabled)
          </Button>
        </Space>

        <Space>
          <Link asChild href="/chat">
            <Button type="primary">Href Primary</Button>
          </Link>
          <Link asChild href="/chat">
            <Button disabled type="primary">
              Href Primary(disabled)
            </Button>
          </Link>
        </Space>

        <Space>
          <Button danger type="default">
            Danger Default
          </Button>
          <Button danger disabled type="default">
            Danger Default(disabled)
          </Button>
        </Space>
        <Space>
          <Button danger type="text">
            Danger Text
          </Button>
          <Button danger disabled type="text">
            Danger Text(disabled)
          </Button>
        </Space>
        <Space>
          <Button danger type="link">
            Danger Link
          </Button>
          <Button danger disabled type="link">
            Danger Link(disabled)
          </Button>
        </Space>
      </Space>
    </View>
  );
};

export default DisabledDemo;
