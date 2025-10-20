import { Flexbox, Skeleton, Text } from '@lobehub/ui-rn';

const AvatarDemo = () => {
  return (
    <Flexbox gap={16}>
      <Text strong>With Avatar</Text>
      <Skeleton avatar />

      <Text strong>Large Avatar (60px)</Text>
      <Skeleton avatar={{ size: 60 }} />

      <Text strong>Square Avatar</Text>
      <Skeleton avatar={{ shape: 'square', size: 50 }} />

      <Text strong>Without Avatar</Text>
      <Skeleton avatar={false} />
    </Flexbox>
  );
};

export default AvatarDemo;
