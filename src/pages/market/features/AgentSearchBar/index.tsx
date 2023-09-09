import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useMarketStore } from '@/store/market';

const AgentSearchBar = memo(() => {
  const { t } = useTranslation('market');
  const [keywords] = useMarketStore((s) => [s.searchKeywords]);
  const { mobile } = useResponsive();
  return (
    <SearchBar
      allowClear
      onChange={(e) => useMarketStore.setState({ searchKeywords: e.target.value })}
      placeholder={t('search.placeholder')}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default AgentSearchBar;
