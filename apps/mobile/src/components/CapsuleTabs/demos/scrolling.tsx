import { CapsuleTabItem, CapsuleTabs, Text, useTheme } from '@lobehub/ui-rn';
import { useState } from 'react';
import { View } from 'react-native';

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
  const token = useTheme();

  return (
    <View style={{ padding: 16 }}>
      <CapsuleTabs items={items} onSelect={setSelectedKey} selectedKey={selectedKey} />
      <Text
        style={{
          color: token.colorTextSecondary,
          fontSize: 14,
          marginTop: 12,
          textAlign: 'center',
        }}
      >
        选中: {selectedKey}
      </Text>
    </View>
  );
};

export default ScrollingDemo;
