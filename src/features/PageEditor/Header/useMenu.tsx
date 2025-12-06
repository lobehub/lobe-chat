import { Icon } from '@lobehub/ui';
import { App } from 'antd';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import { Link2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePageEditorStore, useStoreApi } from '../store';

export const useMenu = (): { menuItems: any[] } => {
  const { t } = useTranslation(['file', 'common']);
  const { message, modal } = App.useApp();
  const theme = useTheme();
  const storeApi = useStoreApi();

  const lastUpdatedTime = usePageEditorStore((s) => s.lastUpdatedTime);
  const wordCount = usePageEditorStore((s) => s.wordCount);

  const menuItems = useMemo(
    () => [
      {
        icon: <Icon icon={Link2} />,
        key: 'copy-link',
        label: t('documentEditor.menu.copyLink'),
        onClick: () => {
          const state = storeApi.getState();
          state.handleCopyLink(t as any, message);
        },
      },
      {
        danger: true,
        icon: <Icon icon={Trash2} />,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: async () => {
          const state = storeApi.getState();
          await state.handleDelete(t as any, message, modal, state.onDelete);
        },
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
    [theme, wordCount, lastUpdatedTime, storeApi, t, message, modal],
  );

  return { menuItems };
};
