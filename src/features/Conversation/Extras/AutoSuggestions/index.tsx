import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import { MessageCircle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { ChatAutoSuggestions, ChatSuggestion } from '@/types/message';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    margin-block-start: 8px;
  `,
  header: css`
    display: flex;
    gap: 6px;
    align-items: center;

    margin-block-end: 8px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,
  icon: css`
    color: ${token.colorTextTertiary};
  `,
  suggestion: css`
    cursor: pointer;

    padding-block: 6px;
    padding-inline: 12px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    font-size: 13px;
    line-height: 1.4;
    color: ${token.colorText};

    background: ${token.colorBgContainer};

    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
    }
  `,
  suggestions: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `,
}));

interface AutoSuggestionsProps extends ChatAutoSuggestions {
  id: string;
}

export const AutoSuggestions = memo<AutoSuggestionsProps>(({ suggestions, loading }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const [sendMessage] = useChatStore((s) => [s.sendMessage]);

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    sendMessage({ message: suggestion.text });
  };

  if (loading) {
    return (
      <Flexbox className={styles.container}>
        <div className={styles.header}>
          <MessageCircle className={styles.icon} size={12} />
          {t('autoSuggestions.generating', { ns: 'chat' })}
        </div>
      </Flexbox>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Flexbox className={styles.container}>
      <div className={styles.header}>
        <MessageCircle className={styles.icon} size={12} />
        {t('autoSuggestions.title', { ns: 'chat' })}
      </div>
      <div className={styles.suggestions}>
        {suggestions.map((suggestion, index) => (
          <Tag
            className={styles.suggestion}
            key={suggestion.id || index}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion.text}
          </Tag>
        ))}
      </div>
    </Flexbox>
  );
});

export default AutoSuggestions;
