'use client';

import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { Brain, Lightbulb, Settings2, Target } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { MemoryType } from '@/app/[variants]/loaders/routeParams';

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

interface MemoryTabsProps {
  value: MemoryType;
}

const MemoryTabs = memo<MemoryTabsProps>(({ value }) => {
  const { styles } = useStyles();
  const navigate = useNavigate();

  const handleChange = (newValue: MemoryType) => {
    navigate(`/memory/${newValue}`);
  };

  return (
    <Flexbox className={styles.container} horizontal justify={'center'}>
      <Segmented
        className={styles.segmented}
        onChange={handleChange as any}
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
          {
            icon: <Settings2 size={16} />,
            label: 'Preferences',
            value: 'preferences',
          },
          {
            icon: <Lightbulb size={16} />,
            label: 'Experiences',
            value: 'experiences',
          },
        ]}
        size="large"
        value={value}
      />
    </Flexbox>
  );
});

export default MemoryTabs;
