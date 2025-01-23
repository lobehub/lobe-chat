import { Icon, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AtomIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { aiChatSelectors } from '@/store/chat/selectors';
import { dotLoading } from '@/styles/loading';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    cursor: pointer;

    width: fit-content;
    padding-block: 4px;
    padding-inline: 8px 12px;
    border-radius: 6px;

    color: ${token.colorTextTertiary};

    &:hover {
      background: ${isDarkMode ? token.colorFillQuaternary : token.colorFillTertiary};
    }
  `,
  expand: css`
    background: ${isDarkMode ? token.colorFillQuaternary : token.colorFillTertiary} !important;
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-size: 12px;
    text-overflow: ellipsis;
  `,
}));

interface ThinkingProps {
  content?: string;
  duration?: number;
  id: string;
}

const Thinking = memo<ThinkingProps>(({ content = '', duration, id }) => {
  const { t } = useTranslation('chat');
  const { styles, cx } = useStyles();

  const [showDetail, setShowDetail] = useState(false);
  const [reasoningDuration, setReasoningDuration] = useState(0);

  const isReasoning = useChatStore(aiChatSelectors.isMessageInReasoning(id));

  useEffect(() => {
    if (isReasoning && !content) {
      setShowDetail(true);
    }

    if (!isReasoning) {
      setShowDetail(false);
    }
  }, [isReasoning, content]);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    let timer: NodeJS.Timeout | undefined;

    if (isReasoning) {
      const startTime = Date.now();

      timer = setInterval(() => {
        setReasoningDuration(Date.now() - startTime);
      }, 100);
    } else {
      clearInterval(timer);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isReasoning]);

  return (
    <Flexbox
      className={cx(styles.container, showDetail && styles.expand)}
      gap={16}
      onClick={() => {
        setShowDetail(!showDetail);
      }}
    >
      <Flexbox distribution={'space-between'} flex={1} horizontal>
        {!duration ? (
          <Flexbox gap={8} horizontal>
            <Icon icon={AtomIcon} />
            <Flexbox horizontal>
              {t('reasoning.thinking', { duration: (reasoningDuration / 1000).toFixed(1) })}
              <div className={cx(dotLoading)} style={{ width: 16 }} />
            </Flexbox>
          </Flexbox>
        ) : (
          <Flexbox gap={8} horizontal>
            <Icon icon={AtomIcon} />
            {t('reasoning.thought', { duration: (duration / 1000).toFixed(1) })}
          </Flexbox>
        )}
        <Icon icon={showDetail ? ChevronDown : ChevronRight} />
      </Flexbox>

      {showDetail && (
        <Flexbox>
          <Markdown variant={'chat'}>{content}</Markdown>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default Thinking;
