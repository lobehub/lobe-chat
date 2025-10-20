import { Flexbox, Skeleton, Text } from '@lobehub/ui-rn';

const CompoundDemo = () => {
  return (
    <Flexbox gap={24}>
      {/* Avatar */}
      <Flexbox gap={12}>
        <Text strong>Skeleton.Avatar</Text>
        <Flexbox gap={8}>
          <Text type="secondary">Default (Circle, 40px)</Text>
          <Skeleton.Avatar />
          <Text type="secondary">Large (64px)</Text>
          <Skeleton.Avatar size={64} />
          <Text type="secondary">Square Shape</Text>
          <Skeleton.Avatar shape="square" />
          <Text type="secondary">Multiple Sizes</Text>
          <Flexbox align="center" gap={8} horizontal>
            <Skeleton.Avatar size={24} />
            <Skeleton.Avatar size={32} />
            <Skeleton.Avatar size={40} />
            <Skeleton.Avatar size={48} />
            <Skeleton.Avatar size={64} />
          </Flexbox>
        </Flexbox>
      </Flexbox>

      {/* Title */}
      <Flexbox gap={12}>
        <Text strong>Skeleton.Title</Text>
        <Flexbox gap={8}>
          <Text type="secondary">Default (60% width)</Text>
          <Skeleton.Title />
          <Text type="secondary">Full Width</Text>
          <Skeleton.Title width="100%" />
          <Text type="secondary">Fixed Width (200px)</Text>
          <Skeleton.Title width={200} />
          <Text type="secondary">Different Widths</Text>
          <Flexbox gap={4}>
            <Skeleton.Title width="80%" />
            <Skeleton.Title width="60%" />
            <Skeleton.Title width="40%" />
          </Flexbox>
        </Flexbox>
      </Flexbox>

      {/* Button */}
      <Flexbox gap={12}>
        <Text strong>Skeleton.Button</Text>
        <Flexbox gap={8}>
          <Text type="secondary">Default</Text>
          <Skeleton.Button />
          <Text type="secondary">Block Button</Text>
          <Skeleton.Button block />
          <Text type="secondary">Circle Button</Text>
          <Skeleton.Button shape="circle" />
          <Text type="secondary">Size Variants</Text>
          <Flexbox align="center" gap={12} horizontal>
            <Skeleton.Button size="small" width={96} />
            <Skeleton.Button size="middle" width={120} />
            <Skeleton.Button size="large" width={160} />
          </Flexbox>
        </Flexbox>
      </Flexbox>

      {/* Paragraph */}
      <Flexbox gap={12}>
        <Text strong>Skeleton.Paragraph</Text>
        <Flexbox gap={8}>
          <Text type="secondary">Default (3 rows)</Text>
          <Skeleton.Paragraph />
          <Text type="secondary">Custom Rows (5)</Text>
          <Skeleton.Paragraph rows={5} />
          <Text type="secondary">Different Width Per Row</Text>
          <Skeleton.Paragraph rows={4} width={['100%', '90%', '75%', '50%']} />
        </Flexbox>
      </Flexbox>

      {/* Combined Usage */}
      <Flexbox gap={12}>
        <Text strong>Combined Layouts</Text>
        <Flexbox gap={16}>
          <Flexbox gap={4}>
            <Text type="secondary">Profile Card</Text>
            <Flexbox align="flex-start" gap={12} horizontal>
              <Skeleton.Avatar size={48} />
              <Flexbox flex={1} gap={4}>
                <Skeleton.Title width="70%" />
                <Skeleton.Paragraph rows={2} width={['90%', '60%']} />
              </Flexbox>
            </Flexbox>
          </Flexbox>

          <Flexbox gap={4}>
            <Text type="secondary">Article Layout</Text>
            <Skeleton.Title width="85%" />
            <Skeleton.Paragraph rows={3} width={['100%', '95%', '70%']} />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default CompoundDemo;
