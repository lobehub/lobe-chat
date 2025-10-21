import { Block, Flexbox, Tag, Text } from '@lobehub/ui-rn';

const UseCaseDemo = () => {
  return (
    <Block gap={12} padding={16} variant="filled">
      <Text as="h3" strong>
        AI Assistant Card
      </Text>
      <Text fontSize={14} type="secondary">
        A powerful AI assistant that can help you with various tasks including coding, writing, and
        problem-solving.
      </Text>
      <Flexbox gap={8} horizontal wrap="wrap">
        <Tag color="blue">AI</Tag>
        <Tag color="green">Chat</Tag>
        <Tag color="purple">Assistant</Tag>
        <Tag color="cyan" variant="outlined">
          Coding
        </Tag>
        <Tag color="orange" variant="outlined">
          Writing
        </Tag>
        <Tag color="magenta" variant="outlined">
          Problem Solving
        </Tag>
      </Flexbox>
    </Block>
  );
};

export default UseCaseDemo;
