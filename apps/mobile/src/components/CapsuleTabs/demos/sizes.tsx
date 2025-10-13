import { CapsuleTabItem, CapsuleTabs, CapsuleTabsSize, Text, useTheme } from '@lobehub/ui-rn';
import React, { useState } from 'react';
import { View } from 'react-native';

const items: CapsuleTabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'updates', label: 'Updates' },
  { key: 'activity', label: 'Activity' },
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
  const token = useTheme();

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
