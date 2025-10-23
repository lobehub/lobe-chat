import { CapsuleTabItem, CapsuleTabs, CapsuleTabsSize, Flexbox, Text } from '@lobehub/ui-rn';
import { useState } from 'react';

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
