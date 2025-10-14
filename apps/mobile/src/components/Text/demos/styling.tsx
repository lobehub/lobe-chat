import { Flexbox, Text } from '@lobehub/ui-rn';

const StylingDemo = () => {
  return (
    <Flexbox gap={8}>
      <Text color="#1890ff">自定义颜色 #1890ff</Text>
      <Text color="#52c41a">自定义颜色 #52c41a</Text>
      <Text weight="400">字重 400</Text>
      <Text weight="600">字重 600</Text>
      <Text weight="700">字重 700</Text>
      <Text fontSize={12}>字号 12</Text>
      <Text fontSize={16}>字号 16</Text>
      <Text fontSize={20}>字号 20</Text>
      <Text align="left">左对齐</Text>
      <Text align="center">居中对齐</Text>
      <Text align="right">右对齐</Text>
    </Flexbox>
  );
};

export default StylingDemo;
