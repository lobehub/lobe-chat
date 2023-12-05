import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const SessionSearchBar = memo(() => {
  const { t } = useTranslation('chat');
  const [keywords, setKeywords] = useState<string | undefined>(undefined);
  const [useSearchSessions] = useSessionStore((s) => [s.useSearchSessions]);

  useSearchSessions(keywords);

  const { mobile } = useResponsive();
  return (
    <SearchBar
      allowClear
      enableShortKey={!mobile}
      onChange={(e) => {
        const newKeywords = e.target.value;
        setKeywords(newKeywords);
        useSessionStore.setState({ isSearching: !!newKeywords });
      }}
      placeholder={t('searchAgentPlaceholder')}
      shortKey={'k'}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default SessionSearchBar;
