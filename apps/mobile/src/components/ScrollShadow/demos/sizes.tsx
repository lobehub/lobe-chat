import { Block, Flexbox, ScrollShadow, Text } from '@lobehub/ui-rn';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text>小阴影 (20%)</Text>
        <Block>
          <ScrollShadow hideScrollBar size={20} style={{ height: 120, width: '100%' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Flexbox key={i} padding={12}>
                <Text>项目 {i + 1}</Text>
              </Flexbox>
            ))}
          </ScrollShadow>
        </Block>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>中等阴影 (40%)</Text>
        <Block>
          <ScrollShadow hideScrollBar size={40} style={{ height: 120, width: '100%' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Flexbox key={i} padding={12}>
                <Text>项目 {i + 1}</Text>
              </Flexbox>
            ))}
          </ScrollShadow>
        </Block>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>大阴影 (60%)</Text>
        <Block>
          <ScrollShadow hideScrollBar size={60} style={{ height: 120, width: '100%' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Flexbox key={i} padding={12}>
                <Text>项目 {i + 1}</Text>
              </Flexbox>
            ))}
          </ScrollShadow>
        </Block>
      </Flexbox>
    </Flexbox>
  );
};
