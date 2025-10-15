import { ActionIconGroup } from '@lobehub/ui';
import { Grid3x3Icon, ListIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'list' | 'masonry';

interface ViewSwitcherProps {
  onViewChange: (view: ViewMode) => void;
  view: ViewMode;
}

const ViewSwitcher = memo<ViewSwitcherProps>(({ view, onViewChange }) => {
  const { t } = useTranslation('components');

  return (
    <ActionIconGroup
      items={[
        {
          icon: ListIcon,
          key: 'list',
          label: t('FileManager.view.list'),
        },
        {
          icon: Grid3x3Icon,
          key: 'masonry',
          label: t('FileManager.view.masonry'),
        },
      ]}
      onActionClick={(action) => onViewChange(action.key as ViewMode)}
      type="group"
      value={view}
    />
  );
});

export default ViewSwitcher;
