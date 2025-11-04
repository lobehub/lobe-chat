import { Flexbox, Text } from '@lobehub/ui-rn';
import { memo } from 'react';

interface SectionHeaderProps {
  count?: number;
  title: string;
}

const SectionHeader = memo<SectionHeaderProps>(({ title, count }) => {
  return (
    <Flexbox paddingBlock={8} paddingInline={16} style={{ paddingTop: 24 }}>
      <Text type={'secondary'}>{[title, count && `(${count})`].filter(Boolean).join(' ')}</Text>
    </Flexbox>
  );
});

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
