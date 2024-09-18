'use client';

import { TabsNav } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { DiscoverTab } from '@/types/discover';

import { useNav } from '../../../features/useNav';

export const useStyles = createStyles(({ css, token }) => ({
  activeNavItem: css`
    background: ${token.colorFillTertiary};
  `,
  container: css`
    height: auto;
    padding-block: 4px;
    background: ${token.colorBgLayout};
  `,
  navItem: css`
    font-weight: 500;
  `,
  title: css`
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  `,
}));

const Nav = memo(() => {
  const { items, activeKey } = useNav();
  const router = useQueryRoute();

  return (
    <Flexbox style={{ paddingInline: 16 }}>
      <TabsNav
        activeKey={activeKey}
        items={items
          .filter((item: any) => item?.key !== DiscoverTab.Home)
          .map((item: any) => ({
            key: item.key,
            label: (
              <div onClick={() => router.push('/discover/search', { query: { type: item.key } })}>
                {item.label}
              </div>
            ),
          }))}
        variant={'compact'}
      />
    </Flexbox>
  );
});

export default Nav;
