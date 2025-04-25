'use client';

import { Tabs } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { usePathname } from 'next/navigation';
import { rgba } from 'polished';
import { memo, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { DiscoverTab } from '@/types/discover';

import { MAX_WIDTH } from '../../../features/const';
import { useNav } from '../../../features/useNav';
import { useScroll } from './useScroll';

export const useStyles = createStyles(({ cx, stylish, css, token }) => ({
  container: cx(
    stylish.blur,
    css`
      position: absolute;
      z-index: 9;
      inset-block-start: 52px;
      inset-inline: 0 0;

      padding-block: 4px;
      border-block-end: 1px solid ${token.colorBorderSecondary};

      background: ${rgba(token.colorBgContainerSecondary, 0.9)};

      transition: all 0.3s ${token.motionEaseInOut};
    `,
  ),
  hide: css`
    transform: translateY(-150%);
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

  return (
    <Center className={cx(styles.container, hide && styles.hide)} height={46}>
      <Flexbox
        style={{
          maxWidth: MAX_WIDTH,
          width: '100%',
        }}
      >
        <Flexbox align={'center'} gap={4} horizontal>
          <Tabs
            activeKey={activeKey}
            compact
            items={items as any}
            onChange={(key) => {
              const href = key === DiscoverTab.Home ? '/discover' : urlJoin('/discover', key);
              router.push(href);
            }}
            style={{
              fontWeight: 500,
            }}
          />
        </Flexbox>
        {!isHome && !isProviders && (
          <Flexbox align={'center'} gap={4} horizontal>
            {/* ↓ cloud slot ↓ */}

            {/* ↑ cloud slot ↑ */}
          </Flexbox>
        )}
      </Flexbox>
    </Center>
  );
});

export default Nav;
