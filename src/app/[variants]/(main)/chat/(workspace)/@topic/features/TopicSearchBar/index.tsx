'use client';

import { SearchBar } from '@lobehub/ui';
import { useUnmount } from 'ahooks';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { useServerConfigStore } from '@/store/serverConfig';

const TopicSearchBar = memo<{ onClear?: () => void }>(({ onClear }) => {
  const { t } = useTranslation('topic');

  const [keywords, setKeywords] = useState('');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const [activeSessionId, useSearchTopics] = useChatStore((s) => [s.activeId, s.useSearchTopics]);

  useSearchTopics(keywords, activeSessionId);
  useUnmount(() => {
    useChatStore.setState({ isSearchingTopic: false });
  });
  return (
    <SearchBar
      autoFocus
      onBlur={() => {
        if (keywords === '') onClear?.();
      }}
      onChange={(e) => {
        const value = e.target.value;

        setKeywords(value);
        useChatStore.setState({ isSearchingTopic: !!value });
      }}
      placeholder={t('searchPlaceholder')}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default TopicSearchBar;
