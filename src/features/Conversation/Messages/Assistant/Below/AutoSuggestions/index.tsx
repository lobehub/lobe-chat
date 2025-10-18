import { Block } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { useChatStore } from '@/store/chat';
import { ChatAutoSuggestions } from '@/types/message';

const useStyles = createStyles(({ css, token, responsive }) => ({
  chip: css`
    width: fit-content;
    padding-block: 8px;
    padding-inline: 16px;
    border-radius: 48px;

    background: ${token.colorBgContainerSecondary};
    ${responsive.mobile} {
      padding-block: 8px;
      padding-inline: 12px;
    }

    &:hover {
      background: ${token.colorBgContainer};
    }
  `,
  container: css`
    margin-block-start: -32px;
  `,
  title: css`
    color: ${token.colorTextDescription};
  `,
}));
interface AutoSuggestionsProps extends ChatAutoSuggestions {
  id: string;
}

export const AutoSuggestions = memo<AutoSuggestionsProps>(({ suggestions, loading, id }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const [sendMessage, updateAutoSuggestionChoices] = useChatStore((s) => [
    s.sendMessage,
    s.updateAutoSuggestionChoices,
  ]);

  if (loading) {
    return (
      <Flexbox align={'center'} className={styles.container} horizontal>
        <Flexbox className={styles.chip} flex={1} height={28} justify={'center'}>
          <BubblesLoading />
        </Flexbox>
      </Flexbox>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>{t('suggestions.title')}</p>
      <Flexbox gap={12}>
        {suggestions.map((q, index) => (
          <Block
            className={styles.chip}
            clickable
            key={q}
            onClick={async () => {
              sendMessage({ message: q });

              updateAutoSuggestionChoices(id, { choice: index, suggestions });
            }}
            variant={'outlined'}
          >
            {q}
          </Block>
        ))}
      </Flexbox>
    </div>
  );
});

export default AutoSuggestions;
