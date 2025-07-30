import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { CapsuleTabs, CapsuleTabItem } from '../index';
import { useThemeToken } from '@/mobile/theme';

const items: CapsuleTabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'work', label: 'Work' },
  { key: 'personal', label: 'Personal' },
  { key: 'health', label: 'Health' },
];

export const BasicDemo: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('all');
  const token = useThemeToken();

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

export default BasicDemo;
