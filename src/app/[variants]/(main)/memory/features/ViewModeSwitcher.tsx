'use client';

import { Segmented } from 'antd';
import { Calendar, LayoutGrid } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'timeline' | 'masonry';

interface ViewModeSwitcherProps {
  onChange: (mode: ViewMode) => void;
  value: ViewMode;
}

const ViewModeSwitcher = memo<ViewModeSwitcherProps>(({ value, onChange }) => {
  const { t } = useTranslation('memory');

  return (
    <Segmented
      onChange={(v) => onChange(v as ViewMode)}
      options={[
        {
          icon: <Calendar size={16} />,
          label: t('viewMode.timeline'),
          value: 'timeline',
        },
        {
          icon: <LayoutGrid size={16} />,
          label: t('viewMode.masonry'),
          value: 'masonry',
        },
      ]}
      value={value}
    />
  );
});

export default ViewModeSwitcher;
