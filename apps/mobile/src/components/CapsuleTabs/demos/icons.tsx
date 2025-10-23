import { CapsuleTabItem, CapsuleTabs, CapsuleTabsSize, Flexbox, Text } from '@lobehub/ui-rn';
import { Briefcase, HeartPulse, Home, Palette } from 'lucide-react-native';
import { useState } from 'react';

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

const SizesDemo = () => {
  const [selected, setSelected] = useState<Record<CapsuleTabsSize, string>>({
    large: items[0].key,
    middle: items[0].key,
    small: items[0].key,
  });

  return (
    <Flexbox gap={16}>
      {sizeOptions.map(({ label, size }) => (
        <Flexbox gap={16} key={size}>
          <Text>{label}</Text>
          <CapsuleTabs
            items={items}
            onSelect={(key) => setSelected((prev) => ({ ...prev, [size]: key }))}
            selectedKey={selected[size]}
            size={size}
          />
        </Flexbox>
      ))}
    </Flexbox>
  );
};

export default SizesDemo;
