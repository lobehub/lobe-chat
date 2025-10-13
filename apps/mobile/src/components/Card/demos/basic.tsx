import { Button, Card, Space, Tag, Text } from '@lobehub/ui-rn';

const BasicDemo = () => {
  return (
    <Card extra={<Tag color="processing">Beta</Tag>} title="自定义服务器">
      <Space align="start" direction="vertical" size="middle">
        <Text>自定义代理服务器地址用于同步聊天和模型偏好。</Text>
        <Space size="small">
          <Button type="default">重置</Button>
          <Button type="primary">保存</Button>
        </Space>
      </Space>
    </Card>
  );
};

export default BasicDemo;
