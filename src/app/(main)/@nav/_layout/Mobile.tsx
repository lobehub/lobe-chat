'use client';

import { Icon, MobileTabBar, type MobileTabBarProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Compass, MessageSquare, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { rgba } from 'polished';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { SidebarTabKey } from '@/store/global/initialState';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    svg {
      fill: ${rgba(token.colorPrimary, 0.33)};
    }
  `,
  container: css`
    position: fixed;
    z-index: 100;
    right: 0;
    bottom: 0;
    left: 0;
  `,
}));

const Nav = memo(() => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const activeKey = useActiveTabKey();
  const router = useRouter();
  const items: MobileTabBarProps['items'] = useMemo(
    () => [
      {
        icon: (active) => (
          <Icon className={active ? styles.active : undefined} icon={MessageSquare} />
        ),
        key: SidebarTabKey.Chat,
        onClick: () => {
          router.push('/chat');
        },
        title: t('tab.chat'),
      },
      {
        icon: (active) => <Icon className={active ? styles.active : undefined} icon={Compass} />,
        key: SidebarTabKey.Market,
        onClick: () => {
          router.push('/market');
        },
        title: t('tab.market'),
      },
      {
        icon: (active) => <Icon className={active ? styles.active : undefined} icon={User} />,
        key: SidebarTabKey.Me,
        onClick: () => {
          router.push('/me');
        },
        title: t('tab.me'),
      },
    ],
    [t],
  );

  return <MobileTabBar activeKey={activeKey} className={styles.container} items={items} />;
});

Nav.displayName = 'MobileNav';

export default Nav;
