import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { CapsuleTabs, CapsuleTabItem } from '../index';
import { useThemeToken } from '@/theme';

const items: CapsuleTabItem[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'ai', label: 'AI' },
  { key: 'design', label: 'Design' },
];

export const CategoriesDemo: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('frontend');
  const token = useThemeToken();

  return (
    <View style={{ padding: 16 }}>
      <Text
        style={{
          color: token.colorText,
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 12,
        }}
      >
        助手分类筛选
      </Text>
      <CapsuleTabs items={items} onSelect={setSelectedKey} selectedKey={selectedKey} />
      <Text
        style={{
          color: token.colorTextSecondary,
          fontSize: 14,
          marginTop: 12,
          textAlign: 'center',
        }}
      >
        当前分类: {selectedKey}
      </Text>
    </View>
  );
};

export default CategoriesDemo;
