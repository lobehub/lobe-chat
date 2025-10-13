import { Flexbox, Text } from '@lobehub/ui-rn';

const HeadingDemo = () => {
  return (
    <Flexbox gap={8}>
      <Text as="h1">H1 标题</Text>
      <Text as="h2">H2 标题</Text>
      <Text as="h3">H3 标题</Text>
      <Text as="h4">H4 标题</Text>
      <Text as="h5">H5 标题</Text>
      <Text as="p">段落文本 Paragraph</Text>
    </Flexbox>
  );
};

export default HeadingDemo;
