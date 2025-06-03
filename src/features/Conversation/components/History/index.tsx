import { ModelTag } from '@lobehub/icons';
import { Icon, Markdown } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ScrollText } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { useAgentStore } from '@/store/agent/store';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

import HistoryDivider from './HistoryDivider';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-inline: 12px;
    border-radius: 12px;
  `,
  content: css`
    color: ${token.colorTextDescription};
  `,
  line: css`
    width: 3px;
    height: 100%;
    background: ${token.colorBorder};
  `,
}));

const History = memo(() => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('chat');
  const [content, model] = useChatStore((s) => {
    const history = topicSelectors.currentActiveTopicSummary(s);
    return [history?.content, history?.model];
  });

  const enableCompressHistory = useAgentStore(
    (s) => agentChatConfigSelectors.currentChatConfig(s).enableCompressHistory,
  );

  return (
    <Flexbox paddingInline={16} style={{ paddingBottom: 8 }}>
      <HistoryDivider enable />
      {enableCompressHistory && !!content && (
        <Flexbox className={styles.container} gap={8}>
          <Flexbox align={'flex-start'} gap={8} horizontal>
            <Center height={20} width={20}>
              <Icon icon={ScrollText} size={16} style={{ color: theme.colorTextDescription }} />
            </Center>
            <Typography.Text type={'secondary'}>{t('historySummary')}</Typography.Text>
            {model && (
              <div>
                <ModelTag model={model} />
              </div>
            )}
          </Flexbox>
          <Flexbox align={'flex-start'} gap={8} horizontal>
            <Flexbox align={'center'} padding={8} width={20}>
              <div className={styles.line} />
            </Flexbox>
            <Markdown className={styles.content} variant={'chat'}>
              {content}
            </Markdown>
          </Flexbox>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default History;
