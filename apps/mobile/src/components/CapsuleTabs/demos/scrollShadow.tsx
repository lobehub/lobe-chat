import { Block, Button, CapsuleTabItem, CapsuleTabs, Flexbox, Text } from '@lobehub/ui-rn';
import { useState } from 'react';

const items: CapsuleTabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'work', label: 'Work' },
  { key: 'personal', label: 'Personal' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'health', label: 'Health' },
  { key: 'finance', label: 'Finance' },
  { key: 'education', label: 'Education' },
  { key: 'entertainment', label: 'Entertainment' },
];

export const ScrollShadowDemo = () => {
  const [selectedKey, setSelectedKey] = useState('all');
  const [enableShadow, setEnableShadow] = useState(true);

  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text>滚动阴影: {enableShadow ? '开启' : '关闭'}</Text>
        <Button onPress={() => setEnableShadow(!enableShadow)} size="small" type="default">
          切换滚动阴影
        </Button>
      </Flexbox>

      <Block>
        <CapsuleTabs
          enableScrollShadow={enableShadow}
          items={items}
          onSelect={setSelectedKey}
          selectedKey={selectedKey}
        />
      </Block>

      <Text>选中: {selectedKey}</Text>
    </Flexbox>
  );
};

export default ScrollShadowDemo;
