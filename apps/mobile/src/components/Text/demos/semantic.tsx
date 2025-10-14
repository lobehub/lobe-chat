import { Flexbox, Text } from '@lobehub/ui-rn';

const SemanticDemo = () => {
  return (
    <Flexbox gap={8}>
      <Text>默认文本</Text>
      <Text type="secondary">次要文本</Text>
      <Text type="success">成功文本</Text>
      <Text type="warning">警告文本</Text>
      <Text type="danger">危险文本</Text>
      <Text type="info">信息文本</Text>
      <Text disabled>禁用文本</Text>
    </Flexbox>
  );
};

export default SemanticDemo;
