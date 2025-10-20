import { Avatar, Button, Flexbox, Skeleton, Text } from '@lobehub/ui-rn';

/**
 * Alignment Demo - Shows Skeleton components aligned with actual components
 * Demonstrates that Skeleton.Button and Skeleton.Avatar match the exact sizes,
 * border radius, and proportions of their real counterparts.
 */
const AlignmentDemo = () => {
  return (
    <Flexbox gap={32}>
      {/* Button Alignment */}
      <Flexbox gap={16}>
        <Text as="h3" strong>
          Button Alignment
        </Text>

        {/* Small Size */}
        <Flexbox gap={8}>
          <Text type="secondary">Small Size</Text>
          <Flexbox align="center" gap={12} horizontal>
            <Skeleton.Button size="small" width={100} />
            <Button size="small">Small Button</Button>
          </Flexbox>
        </Flexbox>

        {/* Middle Size */}
        <Flexbox gap={8}>
          <Text type="secondary">Middle Size (Default)</Text>
          <Flexbox align="center" gap={12} horizontal>
            <Skeleton.Button size="middle" width={120} />
            <Button size="middle">Middle Button</Button>
          </Flexbox>
        </Flexbox>

        {/* Large Size */}
        <Flexbox gap={8}>
          <Text type="secondary">Large Size</Text>
          <Flexbox align="center" gap={12} horizontal>
            <Skeleton.Button size="large" width={140} />
            <Button size="large">Large Button</Button>
          </Flexbox>
        </Flexbox>

        {/* Circle Shape */}
        <Flexbox gap={8}>
          <Text type="secondary">Circle Shape</Text>
          <Flexbox align="center" gap={12} horizontal>
            <Skeleton.Button shape="circle" size="small" />
            <Button shape="circle" size="small">
              S
            </Button>
            <Skeleton.Button shape="circle" size="middle" />
            <Button shape="circle" size="middle">
              M
            </Button>
            <Skeleton.Button shape="circle" size="large" />
            <Button shape="circle" size="large">
              L
            </Button>
          </Flexbox>
        </Flexbox>

        {/* Block Button */}
        <Flexbox gap={8}>
          <Text type="secondary">Block Button</Text>
          <Flexbox gap={8}>
            <Skeleton.Button block />
            <Button block>Block Button</Button>
          </Flexbox>
        </Flexbox>
      </Flexbox>

      {/* Avatar Alignment */}
      <Flexbox gap={16}>
        <Text as="h3" strong>
          Avatar Alignment
        </Text>

        {/* Default Size */}
        <Flexbox gap={8}>
          <Text type="secondary">Default Size (32px)</Text>
          <Flexbox align="center" gap={12} horizontal>
            <Skeleton.Avatar size={32} />
            <Avatar avatar="😊" size={32} />
          </Flexbox>
        </Flexbox>

        {/* Different Sizes */}
        <Flexbox gap={8}>
          <Text type="secondary">Multiple Sizes</Text>
          <Flexbox align="center" gap={12} horizontal>
            <Skeleton.Avatar size={24} />
            <Avatar avatar="👤" size={24} />
            <Skeleton.Avatar size={40} />
            <Avatar avatar="👤" size={40} />
            <Skeleton.Avatar size={64} />
            <Avatar avatar="👤" size={64} />
          </Flexbox>
        </Flexbox>
      </Flexbox>

      {/* Combined Layout */}
      <Flexbox gap={16}>
        <Text as="h3" strong>
          Combined Layout
        </Text>
        <Text type="secondary">Profile Card - Skeleton vs Actual</Text>

        {/* Skeleton Version */}
        <Flexbox gap={8} padding={16} style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text fontSize={12} type="secondary">
            Skeleton Loading State
          </Text>
          <Flexbox align="flex-start" gap={12} horizontal>
            <Skeleton.Avatar size={48} />
            <Flexbox flex={1} gap={8}>
              <Skeleton.Title fontSize={18} width="70%" />
              <Skeleton.Paragraph rows={2} width={['90%', '60%']} />
              <Skeleton.Button block />
            </Flexbox>
          </Flexbox>
        </Flexbox>

        {/* Actual Version */}
        <Flexbox gap={8} padding={16} style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text fontSize={12} type="secondary">
            Loaded State
          </Text>
          <Flexbox align="flex-start" gap={12} horizontal>
            <Avatar avatar="👤" size={48} />
            <Flexbox flex={1} gap={8}>
              <Text fontSize={18} strong>
                John Doe
              </Text>
              <Text type="secondary">
                Software Engineer at Tech Company. Passionate about React Native and mobile
                development.
              </Text>
              <Button block size="middle">
                Follow
              </Button>
            </Flexbox>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default AlignmentDemo;
