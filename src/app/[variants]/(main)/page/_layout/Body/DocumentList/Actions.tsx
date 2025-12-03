'use client';

import { ActionIcon, Dropdown, Icon } from '@lobehub/ui';
import type { MenuProps } from '@lobehub/ui';
import { Check, MoreHorizontal } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';

const Actions = memo(() => {
  const { t } = useTranslation('file');
  const showOnlyPagesNotInLibrary = useFileStore((s) => s.showOnlyPagesNotInLibrary);
  const setShowOnlyPagesNotInLibrary = useFileStore((s) => s.setShowOnlyPagesNotInLibrary);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={Check} style={{ opacity: !showOnlyPagesNotInLibrary ? 1 : 0 }} />,
        key: 'all',
        label: t('documentList.filter.all'),
        onClick: () => setShowOnlyPagesNotInLibrary(false),
      },
      {
        icon: <Icon icon={Check} style={{ opacity: showOnlyPagesNotInLibrary ? 1 : 0 }} />,
        key: 'onlyInPages',
        label: t('documentList.filter.onlyInPages'),
        onClick: () => setShowOnlyPagesNotInLibrary(true),
      },
    ],
    [t, setShowOnlyPagesNotInLibrary, showOnlyPagesNotInLibrary],
  );

  return (
    <Dropdown
      arrow={false}
      menu={{
        items,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
        },
      }}
      trigger={['click']}
    >
      <ActionIcon icon={MoreHorizontal} size={'small'} />
    </Dropdown>
  );
});

export default Actions;
