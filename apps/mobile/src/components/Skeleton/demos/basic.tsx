import { Flexbox, Skeleton, Text } from '@lobehub/ui-rn';

const BasicDemo = () => {
  return (
    <Flexbox gap={16}>
      <Text strong>Basic Skeleton</Text>
      <Skeleton />
      <Text strong>Without Title</Text>
      <Skeleton title={false} />
      <Text strong>With Animation</Text>
      <Skeleton animated={true} />
      <Text strong>Loading Complete</Text>
      <Skeleton loading={false}>
        <Text>This is the actual content that appears when loading is complete.</Text>
      </Skeleton>
    </Flexbox>
  );
};

export default BasicDemo;
