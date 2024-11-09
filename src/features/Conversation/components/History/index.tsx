import { ModelTag } from '@lobehub/icons';
import { Icon, Markdown } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ScrollText } from 'lucide-react';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

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
  const [content, model] = useChatStore((s) => {
    const history = topicSelectors.currentActiveTopicSummary(s);
    return [history?.content, history?.model];
  });

  return (
    <Flexbox paddingInline={16} style={{ paddingBottom: 8 }}>
      <HistoryDivider enable />
      {!!content && (
        <Flexbox className={styles.container} gap={8}>
          <Flexbox align={'flex-start'} gap={8} horizontal>
            <Center height={20} width={20}>
              <Icon
                icon={ScrollText}
                size={{ fontSize: 16 }}
                style={{ color: theme.colorTextDescription }}
              />
            </Center>
            <Typography.Text type={'secondary'}>历史消息总结</Typography.Text>

            {model && (
              <div>
                <ModelTag model={model} />
              </div>
            )}
          </Flexbox>
          <Flexbox align={'flex-start'} gap={8} horizontal>
            <Flexbox align={'center'} padding={8} width={20}>
              <div className={styles.line}></div>
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
