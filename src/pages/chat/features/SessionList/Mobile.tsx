import { SearchBar } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const Sessions = memo<{ children: ReactNode }>(({ children }) => {
  const { t } = useTranslation('common');
  const [keywords] = useSessionStore((s) => [s.searchKeywords, s.createSession]);
  return (
    <>
      <div style={{ padding: '8px 16px' }}>
        <SearchBar
          allowClear
          onChange={(e) => useSessionStore.setState({ searchKeywords: e.target.value })}
          placeholder={t('searchAgentPlaceholder')}
          type={'block'}
          value={keywords}
        />
      </div>
      {children}
    </>
  );
});

export default Sessions;
