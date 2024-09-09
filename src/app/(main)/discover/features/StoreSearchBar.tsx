'use client';

import { Icon, SearchBar, SearchBarProps } from '@lobehub/ui';
import { Select, SelectProps } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronDownIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { useQuery } from '@/hooks/useQuery';
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
  const { q } = useQuery();
  const { items, activeKey } = useNav();
  const [searchKey, setSearchKey] = useQueryState('q');
  const [activeType, setActiveType] = useState<DiscoverTab>(
    activeKey === DiscoverTab.Home ? DiscoverTab.Assistants : activeKey,
  );
  const { t } = useTranslation('discover');
  const { cx, styles } = useStyles();
  const router = useQueryRoute();

  useEffect(() => {
    if (!pathname.includes('/discover/search')) return;
    // 使用 useQueryState 时，当 handleSearch 为空时无法回跳
    if (!q) router.push(urlJoin('/discover', activeType));
  }, [q, pathname]);

  useEffect(() => {
    if (activeKey !== DiscoverTab.Home) setActiveType(activeKey);
  }, [activeKey]);

  const options = useMemo(
    () =>
      items
        .map((item: any) => {
          if (item.key === DiscoverTab.Home) return false;
          return {
            label: item.label,
            value: item.key,
          };
        })
        .filter(Boolean) as SelectProps['options'],
    [items],
  );

  const handleSearch = (value: string) => {
    router.push(urlJoin('/discover/search', activeType), { query: { q: value } });
  };

  return (
    <SearchBar
      addonBefore={
        !mobile &&
        active && (
          <Select
            defaultValue={activeType}
            onSelect={(value) => setActiveType(value)}
            options={options}
            suffixIcon={<Icon icon={ChevronDownIcon} />}
            value={activeType}
          />
        )
      }
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

export default StoreSearchBar;
