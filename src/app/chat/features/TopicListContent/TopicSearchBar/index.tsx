import { SearchBar } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const TopicSearchBar = memo<{ onClear?: () => void }>(({ onClear }) => {
  const { t } = useTranslation('chat');
  const [keywords] = useSessionStore((s) => [s.topicSearchKeywords]);
  const { mobile } = useResponsive();
  return (
    <SearchBar
      autoFocus
      onBlur={() => {
        if (keywords === '') onClear?.();
      }}
      onChange={(e) => {
        useSessionStore.setState({ topicSearchKeywords: e.target.value });
      }}
      placeholder={t('topic.searchPlaceholder')}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keywords}
    />
  );
});

export default TopicSearchBar;
