import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMarketStore } from '@/store/market';

const AgentSearchBar = memo(() => {
  const { t } = useTranslation('market');
  const [keywords, setKeywords] = useMarketStore((s) => [s.searchKeywords, s.setSearchKeywords]);
  const [value, setValue] = useState(keywords);
  const { mobile } = useResponsive();

  const handleSearch = useCallback(() => {
    setKeywords(value);
  }, [value, setKeywords]);

  return (
    <SearchBar
      allowClear
      enableShortKey={!mobile}
      onChange={(e) => setValue(e.target.value)}
      onPressEnter={handleSearch}
      onSubmit={handleSearch}
      placeholder={t('search.placeholder')}
      shortKey={'k'}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={value}
    />
  );
});

export default AgentSearchBar;
