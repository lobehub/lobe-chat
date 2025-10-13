import { Flexbox, Text } from '@lobehub/ui-rn';

const CombinationDemo = () => {
  return (
    <Flexbox gap={8}>
      <Text as="h3" type="danger">
        危险标题
      </Text>

      <Text as="h4" strong type="success">
        成功标题 + 加粗
      </Text>

      <Text italic type="warning" underline>
        警告 + 下划线 + 斜体
      </Text>

      <Text strong underline>
        加粗 + 下划线
      </Text>

      <Text delete italic>
        删除线 + 斜体
      </Text>

      <Text color="#1890ff" fontSize={18} underline weight="600">
        自定义样式组合
      </Text>

      <Text as="h5" color="#52c41a" ellipsis strong>
        标题 + 自定义颜色 + 加粗 + 省略号：这是一段很长的文本内容用于演示组合效果
      </Text>
    </Flexbox>
  );
};

export default CombinationDemo;
