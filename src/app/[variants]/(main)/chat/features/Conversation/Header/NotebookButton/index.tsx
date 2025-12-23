'use client';

import { DESKTOP_HEADER_ICON_SIZE, MOBILE_HEADER_ICON_SIZE } from '@lobechat/const';
import { ActionIcon } from '@lobehub/ui';
import { NotebookIcon, NotebookTabsIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';

interface NotebookButtonProps {
  mobile?: boolean;
}

const NotebookButton = memo<NotebookButtonProps>(({ mobile }) => {
  const { t } = useTranslation('portal');
  const [showNotebook, toggleNotebook] = useChatStore((s) => [s.showNotebook, s.toggleNotebook]);

  return (
    <ActionIcon
      icon={showNotebook ? NotebookTabsIcon : NotebookIcon}
      onClick={() => toggleNotebook()}
      size={mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE}
      title={t('notebook.title')}
      tooltipProps={{
        placement: 'bottom',
      }}
    />
  );
});

export default NotebookButton;
