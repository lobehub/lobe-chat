import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMarketStore } from '@/store/market';

const AgentSearchBar = memo(() => {
  const { t } = useTranslation('market');
  const keywords = useMarketStore((s) => s.searchKeywords);
  const [value, setValue] = useState(keywords);
  const { mobile } = useResponsive();
  return (
    <SearchBar
      allowClear
      enableShortKey={!mobile}
      onChange={(e) => setValue(e.target.value)}
      onPressEnter={() => useMarketStore.setState({ searchKeywords: value })}
      onSubmit={() => useMarketStore.setState({ searchKeywords: value })}
      placeholder={t('search.placeholder')}
      shortKey={'k'}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={value}
    />
  );
});

export default AgentSearchBar;
