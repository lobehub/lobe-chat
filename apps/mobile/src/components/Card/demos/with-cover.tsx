import { Card, Space, Text } from '@lobehub/ui-rn';
import { View } from 'react-native';

const CoverDemo = () => {
  return (
    <Card
      cover={
        <View
          style={{
            backgroundColor: '#2563eb',
            gap: 8,
            justifyContent: 'flex-end',
            minHeight: 160,
            padding: 20,
          }}
        >
          <Text style={{ color: '#dbeafe', fontSize: 12, fontWeight: '600' }}>Featured Agent</Text>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>Lobe Assistant</Text>
          <Text style={{ color: '#bfdbfe', fontSize: 12 }}>多模态工作流 · 实时协同</Text>
        </View>
      }
    >
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>助手卡片</Text>
      </View>
      <Space direction="vertical">
        <Text>通过自定义模板和插件组合，构建属于你的 AI 工作流助手。</Text>
        <Text>支持多平台同步，覆盖聊天、任务流和知识库管理。</Text>
      </Space>
    </Card>
  );
};

export default CoverDemo;
