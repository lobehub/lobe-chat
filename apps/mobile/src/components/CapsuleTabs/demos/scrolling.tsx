import { CapsuleTabItem, CapsuleTabs, Flexbox, Text } from '@lobehub/ui-rn';
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
  { key: 'travel', label: 'Travel' },
  { key: 'sports', label: 'Sports' },
];

export const ScrollingDemo = () => {
  const [selectedKey, setSelectedKey] = useState('all');

  return (
    <Flexbox gap={16}>
      <CapsuleTabs items={items} onSelect={setSelectedKey} selectedKey={selectedKey} />
      <Text>选中: {selectedKey}</Text>
    </Flexbox>
  );
};

export default ScrollingDemo;
