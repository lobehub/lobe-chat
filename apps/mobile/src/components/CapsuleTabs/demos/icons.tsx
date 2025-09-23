import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Briefcase, HeartPulse, Home, Palette } from 'lucide-react-native';

import { CapsuleTabs, type CapsuleTabItem } from '../index';
import { useThemeToken } from '@/theme';

const items: CapsuleTabItem[] = [
  { icon: Home, key: 'home', label: '首页' },
  { icon: Briefcase, key: 'work', label: '工作' },
  { icon: HeartPulse, key: 'health', label: '健康' },
  { icon: Palette, key: 'hobby', label: '兴趣' },
];

const IconsDemo: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('home');
  const token = useThemeToken();

  const selectedLabel = useMemo(() => {
    const item = items.find((demoItem) => demoItem.key === selectedKey);
    return item?.label ?? '';
  }, [selectedKey]);

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
        当前分类：{selectedLabel}
      </Text>
    </View>
  );
};

export default IconsDemo;
