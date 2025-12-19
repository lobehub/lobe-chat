import { Icon } from '@lobehub/ui';
import { App } from 'antd';
import { useResponsive, useTheme } from 'antd-style';
import dayjs from 'dayjs';
import { Link2, PanelLeftRightDashedIcon, SquareChartGanttIcon, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { usePageEditorStore, useStoreApi } from '../store';

export const useMenu = (): { menuItems: any[] } => {
  const { t } = useTranslation(['file', 'common', 'chat']);
  const { message, modal } = App.useApp();
  const theme = useTheme();
  const storeApi = useStoreApi();
  const { lg = true } = useResponsive();

  const lastUpdatedTime = usePageEditorStore((s) => s.lastUpdatedTime);
  const wordCount = usePageEditorStore((s) => s.wordCount);

  const [wideScreen, toggleWideScreen] = useGlobalStore((s) => [
    systemStatusSelectors.wideScreen(s),
    s.toggleWideScreen,
  ]);

  // Wide screen mode only makes sense when screen is large enough
  const showViewModeSwitch = lg;

  const menuItems = useMemo(
    () => [
      ...(showViewModeSwitch
        ? [
            {
              disabled: true,
              key: 'view-mode',
              label: (
                <Flexbox gap={8} horizontal>
                  <Flexbox
                    align="center"
                    gap={4}
                    onClick={() => {
                      if (wideScreen) toggleWideScreen();
                    }}
                    style={{
                      backgroundColor: !wideScreen ? theme.colorFillSecondary : 'transparent',
                      borderRadius: theme.borderRadius,
                      cursor: 'pointer',
                      flex: 1,
                      padding: '8px 12px',
                      pointerEvents: 'auto',
                      transition: `background-color ${theme.motionDurationMid}`,
                    }}
                  >
                    <Icon icon={PanelLeftRightDashedIcon} size={20} />
                    <span
                      style={{
                        color: !wideScreen ? theme.colorText : theme.colorTextSecondary,
                        fontSize: 12,
                      }}
                    >
                      {t('viewMode.normal', { ns: 'chat' })}
                    </span>
                  </Flexbox>
                  <Flexbox
                    align="center"
                    gap={4}
                    onClick={() => {
                      if (!wideScreen) toggleWideScreen();
                    }}
                    style={{
                      backgroundColor: wideScreen ? theme.colorFillSecondary : 'transparent',
                      borderRadius: theme.borderRadius,
                      cursor: 'pointer',
                      flex: 1,
                      padding: '8px 12px',
                      pointerEvents: 'auto',
                      transition: `background-color ${theme.motionDurationMid}`,
                    }}
                  >
                    <Icon icon={SquareChartGanttIcon} size={20} />
                    <span
                      style={{
                        color: wideScreen ? theme.colorText : theme.colorTextSecondary,
                        fontSize: 12,
                      }}
                    >
                      {t('viewMode.wideScreen', { ns: 'chat' })}
                    </span>
                  </Flexbox>
                </Flexbox>
              ),
            },
            {
              type: 'divider' as const,
            },
          ]
        : []),
      {
        icon: <Icon icon={Link2} />,
        key: 'copy-link',
        label: t('pageEditor.menu.copyLink'),
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
            <div>{t('pageEditor.wordCount', { wordCount })}</div>
            <div>
              {lastUpdatedTime
                ? t('pageEditor.editedAt', {
                    time: dayjs(lastUpdatedTime).format('MMMM D, YYYY [at] h:mm A'),
                  })
                : ''}
            </div>
          </div>
        ),
      },
    ],
    [
      theme,
      wordCount,
      lastUpdatedTime,
      storeApi,
      t,
      message,
      modal,
      wideScreen,
      toggleWideScreen,
      showViewModeSwitch,
    ],
  );

  return { menuItems };
};
