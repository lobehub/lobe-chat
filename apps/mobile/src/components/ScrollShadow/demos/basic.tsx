import { Block, Flexbox, ScrollShadow, Text } from '@lobehub/ui-rn';

export default () => {
  return (
    <Block>
      <ScrollShadow hideScrollBar style={{ height: 200, width: '100%' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Flexbox key={i} padding={12}>
            <Text>列表项 {i + 1}</Text>
          </Flexbox>
        ))}
      </ScrollShadow>
    </Block>
  );
};
