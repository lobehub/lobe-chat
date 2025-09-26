import { type CapsuleTabItem, CapsuleTabs, type CapsuleTabsSize } from '@lobehub/ui-rn';
import { Briefcase, HeartPulse, Home, Palette } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { useThemeToken } from '@/theme';

const items: CapsuleTabItem[] = [
  { icon: Home, key: 'home', label: '首页' },
  { icon: Briefcase, key: 'work', label: '工作' },
  { icon: HeartPulse, key: 'health', label: '健康' },
  { icon: Palette, key: 'hobby', label: '兴趣' },
];

const sizeOptions: Array<{ label: string; size: CapsuleTabsSize }> = [
  { label: 'Large', size: 'large' },
  { label: 'Middle', size: 'middle' },
  { label: 'Small', size: 'small' },
];

const SizesDemo: React.FC = () => {
  const [selected, setSelected] = useState<Record<CapsuleTabsSize, string>>({
    large: items[0].key,
    middle: items[0].key,
    small: items[0].key,
  });
  const token = useThemeToken();

  return (
    <View style={{ gap: 16, padding: 16 }}>
      {sizeOptions.map(({ label, size }) => (
        <View key={size}>
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: 14,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Text>
          <CapsuleTabs
            items={items}
            onSelect={(key) => setSelected((prev) => ({ ...prev, [size]: key }))}
            selectedKey={selected[size]}
            size={size}
          />
        </View>
      ))}
    </View>
  );
};

export default SizesDemo;
