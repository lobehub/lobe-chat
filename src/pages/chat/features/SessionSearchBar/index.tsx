import { SearchBar, type SearchBarProps } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const SessionSearchBar = memo<SearchBarProps>((props) => {
  const { t } = useTranslation('common');
  const [keywords] = useSessionStore((s) => [s.searchKeywords]);
  const { mobile } = useResponsive();
  return (
    <SearchBar
      allowClear
      onChange={(e) => useSessionStore.setState({ searchKeywords: e.target.value })}
      placeholder={t('searchAgentPlaceholder')}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keywords}
      {...props}
    />
  );
});

export default SessionSearchBar;
