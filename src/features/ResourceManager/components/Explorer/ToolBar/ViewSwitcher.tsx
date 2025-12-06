import { Icon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Grid3x3Icon, ListIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIconWithChevron from './ActionIconWithChevron';

export type ViewMode = 'list' | 'masonry';

interface ViewSwitcherProps {
  onViewChange: (view: ViewMode) => void;
  view: ViewMode;
}

const ViewSwitcher = memo<ViewSwitcherProps>(({ onViewChange, view }) => {
  const { t } = useTranslation('components');

  const currentViewIcon = view === 'list' ? ListIcon : Grid3x3Icon;
  const currentViewLabel =
    view === 'list' ? t('FileManager.view.list') : t('FileManager.view.masonry');

  const menuItems = useMemo<MenuProps['items']>(() => {
    return [
      {
        icon: <Icon icon={ListIcon} />,
        key: 'list',
        label: t('FileManager.view.list'),
        onClick: () => onViewChange('list'),
      },
      {
        icon: <Icon icon={Grid3x3Icon} />,
        key: 'masonry',
        label: t('FileManager.view.masonry'),
        onClick: () => onViewChange('masonry'),
      },
    ];
  }, [onViewChange, t]);

  return (
    <Dropdown
      menu={{ items: menuItems, selectedKeys: [view] }}
      placement="bottomRight"
      trigger={['click']}
    >
      <ActionIconWithChevron icon={currentViewIcon} title={currentViewLabel} />
    </Dropdown>
  );
});

export default ViewSwitcher;
