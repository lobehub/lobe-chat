import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';

const TopicSearchBar = memo<{ onClear?: () => void }>(({ onClear }) => {
  const { t } = useTranslation('chat');

  const [keywords, setKeywords] = useState<string | undefined>(undefined);
  const { mobile } = useResponsive();

  const useSearchTopics = useChatStore((s) => s.useSearchTopics);

  useSearchTopics(keywords);

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
      placeholder={t('topic.searchPlaceholder')}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default TopicSearchBar;
