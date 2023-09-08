import { Icon, MobileTabBar, type MobileTabBarProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { MessageSquare, Settings2, Sticker } from 'lucide-react';
import Router from 'next/router';
import { rgba } from 'polished';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    svg {
      fill: ${rgba(token.colorPrimary, 0.25)};
    }
  `,
}));

export default memo<{ className?: string }>(({ className }) => {
  const [tab, setTab] = useGlobalStore((s) => [s.sidebarKey, s.switchSideBar]);
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const switchSession = useSessionStore((s) => s.switchSession);
  const items: MobileTabBarProps['items'] = useMemo(
    () => [
      {
        icon: (active) => (
          <Icon className={active ? styles.active : undefined} icon={MessageSquare} />
        ),
        key: 'chat',
        onClick: () => {
          switchSession();
        },
        title: t('tab.chat'),
      },
      {
        icon: (active) => <Icon className={active ? styles.active : undefined} icon={Sticker} />,
        key: 'market',

        title: t('tab.market'),
      },
      {
        icon: (active) => <Icon className={active ? styles.active : undefined} icon={Settings2} />,
        key: 'settings',
        onClick: () => {
          Router.push('/settings');
        },
        title: t('tab.setting'),
      },
    ],
    [t],
  );
  return (
    <MobileTabBar
      activeKey={tab}
      className={className}
      items={items}
      onChange={(key) => setTab(key as any)}
    />
  );
});
