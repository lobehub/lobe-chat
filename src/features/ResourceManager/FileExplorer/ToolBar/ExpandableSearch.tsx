import { ActionIcon } from '@lobehub/ui';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { Search, X } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryState } from '@/hooks/useQueryParam';

const useStyles = createStyles(({ css, token }) => ({
  input: css`
    width: 0;
    padding: 0;
    border: none;

    background: transparent;

    transition: all 0.3s ease;

    &.expanded {
      width: 240px;
      padding-block: 4px;
      padding-inline: 12px;
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadius}px;

      background: ${token.colorBgContainer};
    }

    &:focus {
      border-color: ${token.colorPrimary};
      box-shadow: 0 0 0 2px ${token.colorPrimaryBg};
    }
  `,
}));

const ExpandableSearch = memo(() => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const [keywords, setKeywords] = useState<string>('');
  const inputRef = useRef<any>(null);

  const [query, setQuery] = useQueryState('q', {
    clearOnDefault: true,
  });

  // Sync local state with URL query parameter
  useEffect(() => {
    setKeywords(query || '');
    if (query) {
      setIsExpanded(true);
    }
  }, [query]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleToggle = () => {
    if (isExpanded && keywords) {
      // If expanded with content, clear and collapse
      setKeywords('');
      setQuery(null);
      setIsExpanded(false);
    } else if (isExpanded) {
      // If expanded but empty, just collapse
      setIsExpanded(false);
    } else {
      // If collapsed, expand
      setIsExpanded(true);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeywords(e.target.value);
    if (!e.target.value) setQuery(null);
  };

  const handlePressEnter = () => {
    if (keywords) {
      setQuery(keywords);
    }
  };

  const handleBlur = () => {
    // Only collapse if there's no search query
    if (!keywords) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      <Input
        className={`${styles.input} ${isExpanded ? 'expanded' : ''}`}
        onBlur={handleBlur}
        onChange={handleChange}
        onPressEnter={handlePressEnter}
        placeholder={isExpanded ? t('searchFilePlaceholder') : ''}
        ref={inputRef}
        value={keywords}
      />
      <ActionIcon
        icon={isExpanded && keywords ? X : Search}
        onClick={handleToggle}
        title={isExpanded && keywords ? t('clearSearch', 'Clear search') : t('search', 'Search')}
      />
    </>
  );
});

export default ExpandableSearch;
