'use client';

import { ChatHeader } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { DiscoverTab } from '@/types/discover';

import { MAX_WIDTH } from '../../../features/const';
import { useNav } from '../../../features/useNav';
import { useScroll } from './useScroll';

export const useStyles = createStyles(({ css, token }) => ({
  activeNavItem: css`
    background: ${token.colorFillTertiary};
  `,
  container: css`
    position: absolute;
    z-index: 9;
    inset-block-start: 64px;
    inset-inline: 0 0;

    height: auto;
    padding-block: 4px;

    border-color: transparent;

    transition: all 0.3s ${token.motionEaseInOut};
  `,
  hide: css`
    transform: translateY(-150%);
  `,
  navItem: css`
    font-weight: 500;
  `,
}));

const Nav = memo(() => {
  const [hide, setHide] = useState(false);
  const pathname = usePathname();
  const { cx, styles } = useStyles();
  const { items, activeKey } = useNav();
  const router = useQueryRoute();

  useScroll((scroll, delta) => {
    if (delta < 0) {
      setHide(false);
      return;
    }
    if (scroll > 600 && delta > 0) {
      setHide(true);
    }
  });

  const isHome = pathname === '/discover';
  const isProviders = pathname === '/discover/providers';

  const navBar = items
    .map((item: any) => {
      const isActive = item.key === activeKey;

      const href = item.key === DiscoverTab.Home ? '/discover' : urlJoin('/discover', item.key);

      return (
        <Link
          href={href}
          key={item.key}
          onClick={(e) => {
            e.preventDefault();
            router.push(href);
          }}
        >
          <Button
            className={cx(styles.navItem, isActive && styles.activeNavItem)}
            icon={item.icon}
            type={'text'}
          >
            {item.label}
          </Button>
        </Link>
      );
    })
    .filter(Boolean);

  return (
    <ChatHeader
      className={cx(styles.container, hide && styles.hide)}
      styles={{
        center: {
          flex: 'none',
          justifyContent: 'space-between',
          maxWidth: MAX_WIDTH,
          width: '100%',
        },
        left: { flex: 1 },
        right: { flex: 1 },
      }}
    >
      <Flexbox align={'center'} gap={4} horizontal>
        {navBar}
      </Flexbox>
      {!isHome && !isProviders && (
        <Flexbox align={'center'} gap={4} horizontal>
          {/* ↓ cloud slot ↓ */}
          {/* ↑ cloud slot ↑ */}
        </Flexbox>
      )}
    </ChatHeader>
  );
});

export default Nav;
