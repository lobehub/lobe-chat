'use client';

import { SearchBar } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

const SessionSearchBar = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('chat');
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.Search));

  const [keywords, useSearchSessions, updateSearchKeywords] = useSessionStore((s) => [
    s.sessionSearchKeywords,
    s.useSearchSessions,
    s.updateSearchKeywords,
  ]);

  const { isValidating } = useSearchSessions(keywords);

  return (
    <SearchBar
      allowClear
      enableShortKey={!mobile}
      loading={isValidating}
      onChange={(e) => {
        updateSearchKeywords(e.target.value);
      }}
      placeholder={t('searchAgentPlaceholder')}
      shortKey={hotkey}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default SessionSearchBar;
