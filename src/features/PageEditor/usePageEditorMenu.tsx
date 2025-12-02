import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import { Link2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePageEditorContext } from './PageEditorContext';

export const usePageEditorMenu = (): { menuItems: any[] } => {
  const { t } = useTranslation(['file', 'common']);
  const theme = useTheme();

  const { lastUpdatedTime, handleCopyLink, handleDelete, wordCount } = usePageEditorContext();

  const menuItems = useMemo(
    () => [
      {
        icon: <Icon icon={Link2} />,
        key: 'copy-link',
        label: t('documentEditor.menu.copyLink'),
        onClick: handleCopyLink,
      },
      {
        danger: true,
        icon: <Icon icon={Trash2} />,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: handleDelete,
      },
      {
        type: 'divider' as const,
      },
      {
        disabled: true,
        key: 'page-info',
        label: (
          <div style={{ color: theme.colorTextTertiary, fontSize: 12, lineHeight: 1.6 }}>
            <div>{t('documentEditor.wordCount', { wordCount })}</div>
            <div>
              {lastUpdatedTime
                ? t('documentEditor.editedAt', {
                    time: dayjs(lastUpdatedTime).format('MMMM D, YYYY [at] h:mm A'),
                  })
                : ''}
            </div>
          </div>
        ),
      },
    ],
    [theme, wordCount, lastUpdatedTime, handleDelete, handleCopyLink, t],
  );

  return { menuItems };
};
