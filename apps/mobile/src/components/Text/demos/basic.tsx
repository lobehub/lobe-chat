import { Flexbox, Text } from '@lobehub/ui-rn';

const BasicDemo = () => {
  return (
    <Flexbox gap={8}>
      <Text>默认文本</Text>
      <Text as="p">段落文本</Text>
      <Text strong>加粗文本</Text>
      <Text italic>斜体文本</Text>
      <Text underline>下划线文本</Text>
      <Text delete>删除线文本</Text>
      <Text code>code</Text>
    </Flexbox>
  );
};

export default BasicDemo;
