'use client';

import { SearchBar, SearchBarProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { usePathname } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { withSuspense } from '@/components/withSuspense';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { DiscoverTab } from '@/types/discover';

import { useNav } from './useNav';

export const useStyles = createStyles(({ css, prefixCls, token }) => ({
  active: css`
    box-shadow: ${token.boxShadow};
  `,
  bar: css`
    .${prefixCls}-input-group-wrapper {
      padding: 0;
    }
  `,
}));

interface StoreSearchBarProps extends SearchBarProps {
  mobile?: boolean;
}

const StoreSearchBar = memo<StoreSearchBarProps>(({ mobile, onBlur, onFocus, ...rest }) => {
  const [active, setActive] = useState(false);
  const pathname = usePathname();
  const { activeKey } = useNav();
  const [searchKey, setSearchKey] = useQueryState('q', { clearOnDefault: true, defaultValue: '' });

  const { t } = useTranslation('discover');
  const { cx, styles } = useStyles();
  const router = useQueryRoute();

  const activeType = activeKey === DiscoverTab.Home ? DiscoverTab.Assistants : activeKey;

  useEffect(() => {
    if (!pathname.includes('/discover/search')) return;
    // 使用 useQueryState 时，当 handleSearch 为空时无法回跳
    if (!searchKey) router.push(urlJoin('/discover', activeType), { query: {}, replace: true });
  }, [searchKey, pathname, activeType]);

  const handleSearch = (value: string) => {
    router.push('/discover/search', { query: { q: value, type: activeType } });
  };

  return (
    <SearchBar
      allowClear
      autoFocus={mobile || active}
      className={cx(styles.bar, active && styles.active)}
      defaultValue={searchKey ? String(searchKey) : ''}
      enableShortKey={!mobile}
      onBlur={(e) => {
        setActive(false);
        onBlur?.(e);
      }}
      onChange={(e) => setSearchKey(e.target.value)}
      onFocus={(e) => {
        setActive(true);
        onFocus?.(e);
      }}
      onSearch={handleSearch}
      placeholder={t('search.placeholder')}
      shortKey={'k'}
      spotlight={!mobile}
      style={{ width: mobile || active ? '100%' : 'min(480px,100%)' }}
      styles={{ input: { width: '100%' } }}
      type={'block'}
      value={searchKey ? String(searchKey) : ''}
      {...rest}
    />
  );
});

export default withSuspense(StoreSearchBar);
