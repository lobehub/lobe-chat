import { SearchBar } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useSessionStore } from '@/store/session';

const SessionSearchBar = memo<{ mobile?: boolean }>(({ mobile: controlledMobile }) => {
  const { t } = useTranslation('chat');

  const [keywords, useSearchSessions] = useSessionStore((s) => [
    s.sessionSearchKeywords,
    s.useSearchSessions,
  ]);

  const { isValidating } = useSearchSessions(keywords);

  const isMobile = useIsMobile();
  const mobile = controlledMobile ?? isMobile;

  return (
    <SearchBar
      allowClear
      enableShortKey={!mobile}
      loading={isValidating}
      onChange={(e) => {
        const newKeywords = e.target.value;

        useSessionStore.setState({
          isSearching: !!newKeywords,
          sessionSearchKeywords: newKeywords,
        });
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
