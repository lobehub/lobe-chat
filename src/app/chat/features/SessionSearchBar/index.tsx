import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const SessionSearchBar = memo(() => {
  const { t } = useTranslation('chat');
  const [keywords] = useSessionStore((s) => [s.searchKeywords]);
  const { mobile } = useResponsive();
  return (
    <SearchBar
      allowClear
      enableShortKey={!mobile}
      onChange={(e) => useSessionStore.setState({ searchKeywords: e.target.value })}
      placeholder={t('searchAgentPlaceholder')}
      shortKey={'k'}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default SessionSearchBar;
