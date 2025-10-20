import { Flexbox, Skeleton, Text } from '@lobehub/ui-rn';

const ParagraphDemo = () => {
  return (
    <Flexbox gap={16}>
      <Text strong>Default Paragraph</Text>
      <Skeleton avatar={false} />

      <Text strong>Custom Rows (5)</Text>
      <Skeleton avatar={false} paragraph={{ rows: 5 }} />

      <Text strong>Custom Width (80%)</Text>
      <Skeleton avatar={false} paragraph={{ width: '80%' }} />

      <Text strong>Different Width per Line</Text>
      <Skeleton avatar={false} paragraph={{ rows: 4, width: ['100%', '90%', '75%', '50%'] }} />

      <Text strong>No Paragraph</Text>
      <Skeleton avatar={false} paragraph={false} />
    </Flexbox>
  );
};

export default ParagraphDemo;
