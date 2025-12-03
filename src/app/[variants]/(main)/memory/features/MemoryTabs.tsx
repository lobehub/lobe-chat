'use client';

import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { Brain, Target } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css }) => ({
  container: css`
    padding-block: 16px;
padding-inline: 0;
  `,
  segmented: css`
    .ant-segmented-item-label {
      display: flex;
      gap: 8px;
      align-items: center;
      min-height: 32px;
    }
  `,
}));

export type MemoryCategory = 'identities' | 'contexts';

interface MemoryTabsProps {
  onChange: (category: MemoryCategory) => void;
  value: MemoryCategory;
}

const MemoryTabs = memo<MemoryTabsProps>(({ value, onChange }) => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container} horizontal justify={'center'}>
      <Segmented
        className={styles.segmented}
        onChange={onChange as any}
        options={[
          {
            icon: <Brain size={16} />,
            label: 'Identities',
            value: 'identities',
          },
          {
            icon: <Target size={16} />,
            label: 'Contexts',
            value: 'contexts',
          },
        ]}
        size="large"
        value={value}
      />
    </Flexbox>
  );
});

export default MemoryTabs;
