import { Flexbox, Text } from '@lobehub/ui-rn';

const EllipsisDemo = () => {
  const longText =
    '这是一段很长的文本内容，用于演示省略号功能。这是一段很长的文本内容，用于演示省略号功能。这是一段很长的文本内容，用于演示省略号功能。这是一段很长的文本内容，用于演示省略号功能。';

  return (
    <Flexbox gap={24}>
      <Text as={'h5'}>单行省略</Text>
      <Text as={'p'} ellipsis>
        {longText}
      </Text>

      <Text as={'h5'}>两行省略</Text>
      <Text as={'p'} ellipsis={{ rows: 2 }}>
        {longText}
      </Text>

      <Text as={'h5'}>三行省略</Text>
      <Text as={'p'} ellipsis={{ rows: 3 }}>
        {longText}
      </Text>

      <Text as={'h5'}>使用 numberOfLines</Text>
      <Text as={'p'} numberOfLines={1}>
        {longText}
      </Text>
    </Flexbox>
  );
};

export default EllipsisDemo;
